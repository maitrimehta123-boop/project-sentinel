import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import {
  captureRazorpayPayment,
  fetchRazorpayPayment,
  hasRazorpayConfig,
  verifyPaymentSignature,
} from "../_shared/razorpay.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BodySchema = z.object({
  order_id: z.string().uuid(),
  razorpay_payment_id: z.string().min(5).max(80),
  razorpay_signature: z.string().min(20).max(200),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!hasRazorpayConfig()) {
      return json({ error: "Payment service is temporarily unavailable. Please try again." }, 503);
    }

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
    if (!parsed.success) return json({ error: "Invalid payment confirmation." }, 400);
    const { order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, user_id, total, razorpay_order_id, payment_status, status, order_number, payment_id")
      .eq("id", order_id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order || order.user_id !== user.id) return json({ error: "Order not found." }, 404);

    // Idempotency: a repeated callback must never create a second payment/order state.
    if (order.payment_status === "paid") {
      return json({
        status: "paid",
        order_id: order.id,
        order_number: order.order_number,
        payment_id: order.payment_id,
      });
    }

    if (!order.razorpay_order_id) return json({ error: "Invalid payment confirmation." }, 400);

    // Mandatory Razorpay signature verification. The order id comes from our DB,
    // never from a browser-supplied value.
    const valid = await verifyPaymentSignature(
      order.razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!valid) {
      await admin
        .from("orders")
        .update({ status: "PAYMENT_FAILED", payment_status: "failed" })
        .eq("id", order.id);
      return json({ error: "We could not verify this payment." }, 400);
    }

    const expectedPaise = Math.round(Number(order.total) * 100);
    if (!Number.isSafeInteger(expectedPaise) || expectedPaise < 100) {
      return json({ error: "Invalid payment amount." }, 400);
    }

    // Verify the real payment with Razorpay, including order, amount and currency.
    let payment = await fetchRazorpayPayment(razorpay_payment_id);
    if (
      payment.order_id !== order.razorpay_order_id ||
      payment.amount !== expectedPaise ||
      payment.currency !== "INR"
    ) {
      await admin
        .from("orders")
        .update({ status: "PAYMENT_FAILED", payment_status: "failed" })
        .eq("id", order.id);
      return json({ error: "We could not verify this payment." }, 400);
    }

    // If Razorpay reports authorization rather than capture, capture it server-side.
    // This is the non-webhook fallback for the normal browser checkout flow.
    if (payment.status === "authorized") {
      try {
        payment = await captureRazorpayPayment(razorpay_payment_id, expectedPaise);
      } catch (captureError) {
        console.error(
          "razorpay_capture_error",
          captureError instanceof Error ? captureError.message : "unknown",
        );
        // Another capture process/auto-capture may have won the race; fetch the truth again.
        payment = await fetchRazorpayPayment(razorpay_payment_id);
      }
    }

    if (payment.status !== "captured") {
      await admin
        .from("orders")
        .update({ status: "PAYMENT_AUTHENTICATED", payment_status: "authenticated" })
        .eq("id", order.id);
      return json(409, {
        status: "authenticated",
        error: "Payment was authorized but is not captured yet. Please do not pay again.",
      });
    }

    const { data: updated, error: updateError } = await admin
      .from("orders")
      .update({
        payment_id: razorpay_payment_id,
        transaction_id: razorpay_payment_id,
        payment_method: payment.method ? `razorpay:${payment.method}` : "razorpay",
        payment_status: "paid",
        status: "PAID",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .neq("payment_status", "paid")
      .select("id, order_number")
      .maybeSingle();

    if (updateError) throw updateError;

    return json({
      status: "paid",
      order_id: order.id,
      order_number: updated?.order_number ?? order.order_number,
      payment_id: razorpay_payment_id,
    });
  } catch (e) {
    console.error("verify_payment_error", e instanceof Error ? e.message : "unknown");
    return json({ error: "Payment service is temporarily unavailable. Please try again." }, 500);
  }
});
