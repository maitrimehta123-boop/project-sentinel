/** Shared helpers for Razorpay server-side operations. Secrets never leave this runtime. */

export const RZP_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const RZP_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

export const hasRazorpayConfig = () => Boolean(RZP_KEY_ID && RZP_KEY_SECRET);

/** Constant-time string comparison. */
export const timingSafeEqual = (a: string, b: string) => {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
};

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const hmacSha256Hex = async (secret: string, message: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(sig);
};

/** Verifies the checkout callback signature using the SERVER-stored order id. */
export const verifyPaymentSignature = async (
  storedRazorpayOrderId: string,
  paymentId: string,
  signature: string,
) => {
  const expected = await hmacSha256Hex(RZP_KEY_SECRET, `${storedRazorpayOrderId}|${paymentId}`);
  return timingSafeEqual(expected, signature);
};

/** Creates a Razorpay order. Amount must already be validated server-side, in paise. */
export const createRazorpayOrder = async (body: Record<string, unknown>) => {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Log only a safe status code — never the response body (may echo credentials/context).
    console.error("razorpay_order_create_failed", res.status);
    throw new Error("gateway_unavailable");
  }
  return (await res.json()) as { id: string; amount: number; currency: string };
};

/** Fetches a payment to confirm its true status/amount straight from Razorpay. */
export const fetchRazorpayPayment = async (paymentId: string) => {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: "Basic " + btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`) },
  });
  if (!res.ok) {
    console.error("razorpay_payment_fetch_failed", res.status);
    throw new Error("gateway_unavailable");
  }
  return (await res.json()) as {
    id: string;
    order_id: string;
    status: string;
    amount: number;
    currency: string;
    method?: string;
  };
};
