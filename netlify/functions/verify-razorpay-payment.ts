import { z } from "zod";
import {
  fetchRazorpayPayment,
  MIN_PAYMENT_PAISE,
  getAdminClient,
  getAuthenticatedUser,
  json,
  preflight,
  verifyRazorpaySignature,
  type FunctionEvent,
} from "./_shared/payment.js";

const BodySchema = z.object({
  order_id: z.string().uuid(),
  razorpay_payment_id: z.string().min(5).max(80),
  razorpay_signature: z.string().min(20).max(200),
});

export const handler = async (event: FunctionEvent) => {
  const optionsResponse = preflight(event);
  if (optionsResponse) return optionsResponse;
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const user = await getAuthenticatedUser(event);
    if (!user) return json(401, { error: "Please sign in to continue." });
    const parsed = BodySchema.safeParse(JSON.parse(event.body ?? "{}"));
    if (!parsed.success) return json(400, { error: "Invalid payment confirmation." });

    const { order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
    const admin = getAdminClient();
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, user_id, total, razorpay_order_id, payment_status, order_number, payment_id")
      .eq("id", order_id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.user_id !== user.id) return json(404, { error: "Order not found." });

    if (order.payment_status === "paid") {
      return json(200, {
        status: "paid",
        order_id: order.id,
        order_number: order.order_number,
        payment_id: order.payment_id,
      });
    }
    const expectedPaise = Math.round(Number(order.total) * 100);
    if (!order.razorpay_order_id || !Number.isFinite(expectedPaise) || expectedPaise < MIN_PAYMENT_PAISE) {
      return json(400, { error: "Invalid payment confirmation." });
    }

    if (!verifyRazorpaySignature(order.razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      await admin.from("orders").update({ status: "PAYMENT_FAILED", payment_status: "failed" }).eq("id", order.id);
      return json(400, { error: "Payment signature verification failed." });
    }

    const payment = await fetchRazorpayPayment(razorpay_payment_id);
    const paymentMatches =
      payment.order_id === order.razorpay_order_id &&
      payment.amount === expectedPaise &&
      payment.currency === "INR";
    if (!paymentMatches || payment.status !== "captured") {
      await admin.from("orders").update({
        status: paymentMatches ? "PAYMENT_AUTHENTICATED" : "PAYMENT_FAILED",
        payment_status: paymentMatches ? "authenticated" : "failed",
      }).eq("id", order.id);
      return json(400, { error: "Payment has not been captured and cannot be marked paid." });
    }

    const { data: updated, error: updateError } = await admin.from("orders").update({
      payment_id: razorpay_payment_id,
      transaction_id: razorpay_payment_id,
      payment_method: payment.method ? `razorpay:${payment.method}` : "razorpay",
      payment_status: "paid",
      status: "PAID",
      paid_at: new Date().toISOString(),
    }).eq("id", order.id).neq("payment_status", "paid").select("id, order_number").maybeSingle();
    if (updateError) throw updateError;

    return json(200, {
      status: "paid",
      order_id: order.id,
      order_number: updated?.order_number ?? order.order_number,
      payment_id: razorpay_payment_id,
    });
  } catch (error) {
    console.error("verify_razorpay_payment_error", error instanceof Error ? error.message : "unknown");
    return json(502, { error: "Could not verify the payment. Please contact support if money was debited." });
  }
};