import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { fetchRazorpayPayment, hasRazorpayConfig, verifyPaymentSignature } from "../_shared/razorpay.ts";

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
    if (!parsed.success) return json({ error: "Invalid payment confirmation." }, 400);
    const { order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Authorisation: the order must belong to the signed-in customer.
    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, total, razorpay_order_id, payment_status, status, order_number, payment_id")
      .eq("id", order_id)
      .maybeSingle();
    if (!order || order.user_id !== user.id) return json({ error: "Order not found." }, 404);

    // Idempotency: already verified → return the same result, no duplicate processing.
    if (order.payment_status === "paid") {
      return json({ status: "paid", order_id: order.id, order_number: order.order_number, payment_id: order.payment_id });
    }
    if (!order.razorpay_order_id) return json({ error: "Invalid payment confirmation." }, 400);

    // Signature is verified against the SERVER-stored Razorpay order id.
    const valid = await verifyPaymentSignature(order.razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      await admin.from("orders").update({ status: "PAYMENT_FAILED", payment_status: "failed" }).eq("id", order.id);
      return json({ error: "We could not verify this payment." }, 400);
    }

    // Confirm the truth with Razorpay: right order, right amount, captured/authorized.
    const payment = await fetchRazorpayPayment(razorpay_payment_id);
    const expectedPaise = Math.round(Number(order.total) * 100);
    if (payment.order_id !== order.razorpay_order_id || payment.amount !== expectedPaise || payment.currency !== "INR") {
      await admin.from("orders").update({ status: "PAYMENT_FAILED", payment_status: "failed" }).eq("id", order.id);
      return json({ error: "We could not verify this payment." }, 400);
    }

    const captured = payment.status === "captured";
    const { data: updated } = await admin
      .from("orders")
      .update({
        payment_id: razorpay_payment_id,
        transaction_id: razorpay_payment_id,
        payment_method: payment.method ? `razorpay:${payment.method}` : "razorpay",
        payment_status: captured ? "paid" : "authenticated",
        status: captured ? "PAID" : "PAYMENT_AUTHENTICATED",
        paid_at: captured ? new Date().toISOString() : null,
      })
      .eq("id", order.id)
      .neq("payment_status", "paid")
      .select("id, order_number")
      .maybeSingle();

    return json({
      status: captured ? "paid" : "authenticated",
      order_id: order.id,
      order_number: updated?.order_number ?? order.order_number,
      payment_id: razorpay_payment_id,
    });
  } catch (e) {
    console.error("verify_payment_error", (e as Error)?.message);
    return json({ error: "Payment service is temporarily unavailable. Please try again." }, 500);
  }
});
