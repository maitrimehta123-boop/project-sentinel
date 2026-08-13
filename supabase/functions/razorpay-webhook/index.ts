import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { hmacSha256Hex, timingSafeEqual } from "../_shared/razorpay.ts";

/**
 * Razorpay webhook. Public endpoint (no JWT) — authenticity comes from the
 * X-Razorpay-Signature HMAC verified with RAZORPAY_WEBHOOK_SECRET.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
  if (!secret) {
    console.error("webhook_secret_missing");
    return new Response("Service unavailable", { status: 503, headers: corsHeaders });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = await hmacSha256Hex(secret, raw);
  if (!signature || !timingSafeEqual(expected, signature)) {
    console.error("webhook_invalid_signature");
    return new Response("Invalid signature", { status: 401, headers: corsHeaders });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400, headers: corsHeaders });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const payment = event?.payload?.payment?.entity ?? null;
  const eventType: string = event?.event ?? "unknown";
  const eventId: string =
    req.headers.get("x-razorpay-event-id") ||
    `${eventType}:${payment?.id ?? "none"}:${event?.created_at ?? ""}`;

  // Idempotency: the unique event_id makes replays a no-op.
  const { error: dupErr } = await admin.from("payment_events").insert({
    event_id: eventId,
    event_type: eventType,
    payment_id: payment?.id ?? null,
    razorpay_order_id: payment?.order_id ?? null,
    payload: event,
  });
  if (dupErr) {
    // 23505 = already processed.
    if ((dupErr as any).code === "23505") return new Response("ok", { status: 200, headers: corsHeaders });
    console.error("webhook_store_failed");
    return new Response("Service unavailable", { status: 503, headers: corsHeaders });
  }

  if (payment?.order_id) {
    const { data: order } = await admin
      .from("orders")
      .select("id, total, payment_status")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (order) {
      const amountOk = Math.round(Number(order.total) * 100) === Number(payment.amount);

      if (eventType === "payment.captured" && amountOk && order.payment_status !== "paid") {
        await admin
          .from("orders")
          .update({
            payment_id: payment.id,
            transaction_id: payment.id,
            payment_status: "paid",
            status: "PAID",
            paid_at: new Date().toISOString(),
          })
          .eq("id", order.id)
          .neq("payment_status", "paid");
      } else if (eventType === "payment.failed" && order.payment_status !== "paid") {
        await admin
          .from("orders")
          .update({ payment_status: "failed", status: "PAYMENT_FAILED" })
          .eq("id", order.id);
      } else if (
        (eventType === "refund.processed" || eventType === "refund.created") &&
        order.payment_status === "paid"
      ) {
        await admin.from("orders").update({ payment_status: "refunded", status: "REFUNDED" }).eq("id", order.id);
      }
    }
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
