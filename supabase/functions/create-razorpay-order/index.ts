import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { createRazorpayOrder, hasRazorpayConfig, RZP_KEY_ID } from "../_shared/razorpay.ts";
import { couponDiscount, gstFor, shippingFor, type CouponRow } from "../_shared/pricing.ts";
import { CATALOG_PRICES } from "../_shared/catalog.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BodySchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().min(1).max(80),
        quantity: z.number().int().min(1).max(20),
        variant: z.string().max(120).nullable().optional(),
      }),
    )
    .min(1)
    .max(30),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(10).max(15),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().regex(/^\d{6}$/),
  notes: z.string().trim().max(500).optional().nullable(),
  coupon_code: z.string().trim().max(40).optional().nullable(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!hasRazorpayConfig()) return json({ error: "Payment service is temporarily unavailable. Please try again." }, 503);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Please sign in to continue." }, 401);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Please sign in to continue." }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Please check your details and try again." }, 400);
    const b = parsed.data;

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // --- Trusted pricing: prices come from the database, never from the browser ---
    const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
    const ids = [...new Set(b.items.map((i) => i.product_id))].filter(isUuid);
    let products: { id: string; name: string; price: number; stock: number; active: boolean }[] = [];
    if (ids.length) {
      const { data, error: prodErr } = await admin
        .from("products")
        .select("id, name, price, stock, active, image_url")
        .in("id", ids);
      if (prodErr) throw prodErr;
      products = (data ?? []) as typeof products;
    }

    const byId = new Map((products ?? []).map((p) => [p.id, p]));
    let subtotal = 0;
    const lineItems: Record<string, unknown>[] = [];

    for (const item of b.items) {
      const dbProduct = byId.get(item.product_id);
      const builtIn = CATALOG_PRICES[item.product_id];
      if (dbProduct && !dbProduct.active) return json({ error: "One of the items is no longer available." }, 400);
      if (dbProduct && dbProduct.stock < item.quantity) {
        return json({ error: `Not enough stock for ${dbProduct.name}.` }, 400);
      }
      const p = dbProduct
        ? { id: dbProduct.id, name: dbProduct.name, price: Number(dbProduct.price) }
        : builtIn
          ? { id: item.product_id, name: builtIn.name, price: builtIn.price }
          : null;
      if (!p) return json({ error: "One of the items is no longer available." }, 400);
      const price = Number(p.price);
      subtotal += price * item.quantity;
      lineItems.push({
        product_id: p.id,
        name: p.name,
        price,
        quantity: item.quantity,
        variant: item.variant ?? null,
      });
    }
    subtotal = Math.round(subtotal);
    if (subtotal <= 0) return json({ error: "Invalid order amount." }, 400);

    let coupon: CouponRow | null = null;
    if (b.coupon_code) {
      const { data: c } = await admin
        .from("coupons")
        .select("code, discount_type, discount_value, min_order, max_discount, usage_limit, used_count, active, expires_at")
        .ilike("code", b.coupon_code)
        .maybeSingle();
      coupon = (c as CouponRow | null) ?? null;
    }
    const discount = couponDiscount(coupon, subtotal);
    const shipping = shippingFor(subtotal - discount);
    const gst = gstFor(subtotal - discount);
    const total = Math.max(1, subtotal - discount + shipping + gst);
    const amountPaise = Math.round(total * 100);

    // --- Internal order first, so every payment attempt is traceable ---
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: b.full_name,
        customer_email: b.email,
        customer_phone: b.phone,
        address: `${b.address}, ${b.city}, ${b.state} - ${b.pincode}`,
        city: b.city,
        state: b.state,
        pincode: b.pincode,
        country: "India",
        items: lineItems,
        subtotal,
        discount,
        shipping,
        total,
        coupon_code: coupon?.code ?? null,
        notes: b.notes || null,
        status: "PENDING_PAYMENT",
        payment_status: "pending",
        payment_method: "razorpay",
      })
      .select("id, order_number")
      .single();
    if (orderErr) throw orderErr;

    let rzpOrder;
    try {
      rzpOrder = await createRazorpayOrder({
        amount: amountPaise,
        currency: "INR",
        receipt: order.order_number ?? order.id,
        payment_capture: 1,
        notes: { internal_order_id: order.id, user_id: user.id },
      });
    } catch {
      await admin.from("orders").update({ status: "PAYMENT_FAILED" }).eq("id", order.id);
      return json({ error: "Payment service is temporarily unavailable. Please try again." }, 503);
    }

    await admin.from("orders").update({ razorpay_order_id: rzpOrder.id }).eq("id", order.id);

    return json({
      key_id: RZP_KEY_ID,
      razorpay_order_id: rzpOrder.id,
      amount: amountPaise,
      currency: "INR",
      order_id: order.id,
      order_number: order.order_number,
      customer: { name: b.full_name, email: b.email, contact: b.phone },
    });
  } catch (e) {
    console.error("create_order_error", (e as Error)?.message);
    return json({ error: "Payment service is temporarily unavailable. Please try again." }, 500);
  }
});
