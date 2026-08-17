import { createHmac, timingSafeEqual } from "node:crypto";
import { getAdminClient, json, type FunctionEvent } from "./_shared/payment.js";

/**
 * Razorpay webhook (Netlify). Public endpoint — authenticity comes purely from
 * the X-Razorpay-Signature HMAC verified with RAZORPAY_WEBHOOK_SECRET.
 * Handles payment.captured, payment.failed, order.paid and refunds, idempotently.
 */
const verifySignature = (raw: string, signature: string, secret: string) => {
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
};

export const handler = async (event: FunctionEvent) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ?? "";
  if (!secret) {
    console.error("webhook_secret_missing");
    return json(503, { error: "Webhook not configured" });
  }

  const raw = event.body ?? "";
  const signature = event.headers["x-razorpay-signature"] ?? event.headers["X-Razorpay-Signature"] ?? "";
  if (!signature || !verifySignature(raw, signature, secret)) {
    console.error("webhook_invalid_signature");
    return json(401, { error: "Invalid signature" });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(400, { error: "Bad request" });
  }

  const admin = getAdminClient();
  const eventType: string = payload?.event ?? "unknown";
  const payment = payload?.payload?.payment?.entity ?? null;
  const gatewayOrder = payload?.payload?.order?.entity ?? null;
  const razorpayOrderId: string | null = payment?.order_id ?? gatewayOrder?.id ?? null;
  const eventId: string =
    event.headers["x-razorpay-event-id"] ||
    `${eventType}:${payment?.id ?? razorpayOrderId ?? "none"}:${payload?.created_at ?? ""}`;

  // Idempotency — the unique event_id makes replays a safe no-op.
  const { error: insertError } = await admin.from("payment_events").insert({
    event_id: eventId,
    event_type: eventType,
    payment_id: payment?.id ?? null,
    razorpay_order_id: razorpayOrderId,
    payload,
  });
  if (insertError) {
    if ((insertError as any).code === "23505") return json(200, { ok: true, duplicate: true });
    console.error("webhook_store_failed");
    return json(503, { error: "Webhook storage unavailable" });
  }

  if (!razorpayOrderId) return json(200, { ok: true });

  const { data: order } = await admin
    .from("orders")
    .select("id, total, payment_status")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (!order) return json(200, { ok: true });

  const expectedPaise = Math.round(Number(order.total) * 100);
  const amountOk =
    (payment && Number(payment.amount) === expectedPaise) ||
    (!payment && gatewayOrder && Number(gatewayOrder.amount_paid) === expectedPaise);

  const markPaid = (eventType === "payment.captured" || eventType === "order.paid") && amountOk;

  if (markPaid && order.payment_status !== "paid") {
    await admin
      .from("orders")
      .update({
        payment_id: payment?.id ?? null,
        transaction_id: payment?.id ?? null,
        payment_method: payment?.method ? `razorpay:${payment.method}` : "razorpay",
        payment_status: "paid",
        status: "PAID",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .neq("payment_status", "paid");
  } else if (eventType === "payment.failed" && order.payment_status !== "paid") {
    await admin.from("orders").update({ payment_status: "failed", status: "PAYMENT_FAILED" }).eq("id", order.id);
  } else if (
    (eventType === "refund.processed" || eventType === "refund.created") &&
    order.payment_status === "paid"
  ) {
    await admin.from("orders").update({ payment_status: "refunded", status: "REFUNDED" }).eq("id", order.id);
  }

  return json(200, { ok: true });
};
