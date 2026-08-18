import { z } from "zod";
import {
  captureRazorpayPayment,
  fetchRazorpayPayment,
  getAdminClient,
  getAuthenticatedUser,
  getConfig,
  json,
  preflight,
  verifyRazorpaySignature,
  type FunctionEvent,
} from "./_shared/payment";

const BodySchema = z.object({
  order_id: z.string().uuid(),
  razorpay_payment_id: z.string().min(5).max(80),
  razorpay_signature: z.string().min(20).max(200),
});

/**
 * Single verification path: signature (against the SERVER-stored Razorpay
 * order id) → Razorpay API truth → capture when only authorized → mark PAID.
 * Idempotent: a repeated call on a paid order returns the same result.
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
      return json(400, { error: "Invalid payment confirmation." });
    }
    const parsed = BodySchema.safeParse(raw);
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

    // Idempotency — never process the same payment twice.
    if (order.payment_status === "paid") {
      return json(200, {
        status: "paid",
        order_id: order.id,
        order_number: order.order_number,
        payment_id: order.payment_id ?? razorpay_payment_id,
      });
    }
    if (!order.razorpay_order_id) return json(400, { error: "Invalid payment confirmation." });

    if (!verifyRazorpaySignature(order.razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      await admin
        .from("orders")
        .update({ status: "PAYMENT_FAILED", payment_status: "failed" })
        .eq("id", order.id)
        .neq("payment_status", "paid");
      return json(400, { error: "We could not verify this payment." });
    }

    const expectedPaise = Math.round(Number(order.total) * 100);
    let payment = await fetchRazorpayPayment(razorpay_payment_id);

    if (
      payment.order_id !== order.razorpay_order_id ||
      payment.amount !== expectedPaise ||
      payment.currency !== "INR"
    ) {
      await admin
        .from("orders")
        .update({ status: "PAYMENT_FAILED", payment_status: "failed" })
        .eq("id", order.id)
        .neq("payment_status", "paid");
      return json(400, { error: "We could not verify this payment." });
    }

    if (payment.status === "failed") {
      await admin
        .from("orders")
        .update({ status: "PAYMENT_FAILED", payment_status: "failed" })
        .eq("id", order.id)
        .neq("payment_status", "paid");
      return json(400, { error: "This payment did not go through. Please try again." });
    }

    // Server-side capture fallback for accounts that leave payments "authorized".
    if (payment.status === "authorized") {
      try {
        await captureRazorpayPayment(razorpay_payment_id, expectedPaise);
      } catch {
        /* fall through — re-read the true state below */
      }
      payment = await fetchRazorpayPayment(razorpay_payment_id);
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

    return json(200, {
      status: captured ? "paid" : "authenticated",
      order_id: order.id,
      order_number: updated?.order_number ?? order.order_number,
      payment_id: razorpay_payment_id,
    });
  } catch (error) {
    console.error("verify_razorpay_payment_error", error instanceof Error ? error.message : "unknown");
    return json(500, { error: "Could not verify the payment. Please try again." });
  }
};
