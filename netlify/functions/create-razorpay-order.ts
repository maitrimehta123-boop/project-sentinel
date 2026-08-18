import { z } from "zod";
import {
  createRazorpayOrder,
  getAdminClient,
  getAuthenticatedUser,
  getConfig,
  json,
  preflight,
  MIN_PAYMENT_PAISE,
  type FunctionEvent,
} from "./_shared/payment";
import { CATALOG_PRICES } from "./_shared/catalog";
import { couponDiscount, gstFor, shippingFor, type CouponRow } from "./_shared/pricing";

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

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/**
 * Single production payment backend: creates the internal order with a
 * server-computed amount, then creates the matching Razorpay order.
 * All secrets stay in the Netlify function runtime.
 */
export const handler = async (event: FunctionEvent) => {
  const optionsResponse = preflight(event);
  if (optionsResponse) return optionsResponse;
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    getConfig();
  } catch (configError) {
    console.error("payment_config_error", (configError as Error).message);
    return json(503, { error: "Payment service is temporarily unavailable. Please try again." });
  }

  try {
    const user = await getAuthenticatedUser(event);
    if (!user) return json(401, { error: "Please sign in to continue." });

    let raw: unknown;
    try {
      raw = JSON.parse(event.body ?? "{}");
    } catch {
      return json(400, { error: "Please check your details and try again." });
    }
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) return json(400, { error: "Please check your details and try again." });
    const b = parsed.data;

    const admin = getAdminClient();

    // --- Trusted pricing: database first, built-in catalog for slug ids ---
    const ids = [...new Set(b.items.map((i) => i.product_id))].filter(isUuid);
    let products: { id: string; name: string; price: number; stock: number; active: boolean }[] = [];
    if (ids.length) {
      const { data, error } = await admin
        .from("products")
        .select("id, name, price, stock, active")
        .in("id", ids);
      if (error) throw error;
      products = (data ?? []) as typeof products;
    }
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems: Record<string, unknown>[] = [];
    for (const item of b.items) {
      const dbProduct = byId.get(item.product_id);
      const builtIn = CATALOG_PRICES[item.product_id];
      if (dbProduct && !dbProduct.active) return json(400, { error: "One of the items is no longer available." });
      if (dbProduct && dbProduct.stock < item.quantity) {
        return json(400, { error: `Not enough stock for ${dbProduct.name}.` });
      }
      const p = dbProduct
        ? { id: dbProduct.id, name: dbProduct.name, price: Number(dbProduct.price) }
        : builtIn
          ? { id: item.product_id, name: builtIn.name, price: builtIn.price }
          : null;
      if (!p) return json(400, { error: "One of the items is no longer available." });
      subtotal += p.price * item.quantity;
      lineItems.push({
        product_id: p.id,
        name: p.name,
        price: p.price,
        quantity: item.quantity,
        variant: item.variant ?? null,
      });
    }
    subtotal = Math.round(subtotal);
    if (subtotal <= 0) return json(400, { error: "Invalid order amount." });

    let coupon: CouponRow | null = null;
    if (b.coupon_code) {
      const { data } = await admin
        .from("coupons")
        .select(
          "code, discount_type, discount_value, min_order, max_discount, usage_limit, used_count, active, expires_at",
        )
        .ilike("code", b.coupon_code)
        .maybeSingle();
      coupon = (data as CouponRow | null) ?? null;
    }
    const discount = couponDiscount(coupon, subtotal);
    const shipping = shippingFor(subtotal - discount);
    const gst = gstFor(subtotal - discount);
    const total = Math.max(1, subtotal - discount + shipping + gst);
    const amountPaise = Math.max(MIN_PAYMENT_PAISE, Math.round(total * 100));

    // --- Internal order first so every attempt is traceable ---
    const { data: order, error: orderError } = await admin
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
    if (orderError) throw orderError;

    let rzpOrder;
    try {
      rzpOrder = await createRazorpayOrder(order.order_number ?? order.id, order.id, user.id, amountPaise);
    } catch {
      await admin.from("orders").update({ status: "PAYMENT_FAILED" }).eq("id", order.id);
      return json(503, { error: "Payment service is temporarily unavailable. Please try again." });
    }

    await admin.from("orders").update({ razorpay_order_id: rzpOrder.id }).eq("id", order.id);

    return json(200, {
      key_id: getConfig().razorpayKeyId,
      razorpay_order_id: rzpOrder.id,
      amount: amountPaise,
      currency: "INR",
      order_id: order.id,
      order_number: order.order_number,
      customer: { name: b.full_name, email: b.email, contact: b.phone },
    });
  } catch (error) {
    console.error("create_razorpay_order_error", error instanceof Error ? error.message : "unknown");
    return json(500, { error: "Could not create the payment order. Please try again." });
  }
};
