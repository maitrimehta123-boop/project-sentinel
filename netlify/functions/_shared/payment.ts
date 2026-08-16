import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Minimum amount Razorpay accepts (₹1). */
export const MIN_PAYMENT_PAISE = 100;

export type FunctionEvent = {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
};

export type FunctionResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export const json = (statusCode: number, body: unknown): FunctionResponse => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

export const preflight = (event: FunctionEvent) =>
  event.httpMethod === "OPTIONS" ? json(200, { ok: true }) : null;

const env = (name: string) => process.env[name]?.trim() ?? "";

export const getConfig = () => {
  const supabaseUrl = env("SUPABASE_URL") || env("VITE_SUPABASE_URL");
  const supabaseAnonKey =
    env("SUPABASE_ANON_KEY") || env("VITE_SUPABASE_PUBLISHABLE_KEY") || env("VITE_SUPABASE_ANON_KEY");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const razorpayKeyId = env("RAZORPAY_KEY_ID");
  const razorpayKeySecret = env("RAZORPAY_KEY_SECRET");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !razorpayKeyId || !razorpayKeySecret) {
    throw new Error("missing_server_configuration");
  }
  // Accept Razorpay test or live keys. The secret never leaves this server runtime.
  if (!/^rzp_(test|live)_/.test(razorpayKeyId)) throw new Error("invalid_razorpay_key");

  return { supabaseUrl, supabaseAnonKey, serviceRoleKey, razorpayKeyId, razorpayKeySecret };
};

export const getAuthenticatedUser = async (event: FunctionEvent) => {
  const config = getConfig();
  const authorization = event.headers.authorization ?? event.headers.Authorization ?? "";
  if (!authorization.startsWith("Bearer ")) return null;

  const client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
};

export const getAdminClient = () => {
  const config = getConfig();
  return createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const razorpayAuth = (keyId: string, keySecret: string) =>
  `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

export const createRazorpayOrder = async (
  receipt: string,
  internalOrderId: string,
  userId: string,
  amountPaise: number,
) => {
  const config = getConfig();
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: razorpayAuth(config.razorpayKeyId, config.razorpayKeySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { internal_order_id: internalOrderId, user_id: userId },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("razorpay_order_create_failed", response.status, details.slice(0, 1000));
    throw new Error("razorpay_order_create_failed");
  }
  return (await response.json()) as { id: string; amount: number; currency: string };
};

export const verifyRazorpaySignature = (razorpayOrderId: string, paymentId: string, signature: string) => {
  const { razorpayKeySecret } = getConfig();
  const expected = createHmac("sha256", razorpayKeySecret)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const suppliedBuffer = Buffer.from(signature, "utf8");
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
};

export const fetchRazorpayPayment = async (paymentId: string) => {
  const config = getConfig();
  const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: razorpayAuth(config.razorpayKeyId, config.razorpayKeySecret) },
  });
  if (!response.ok) {
    const details = await response.text();
    console.error("razorpay_payment_fetch_failed", response.status, details.slice(0, 1000));
    throw new Error("razorpay_payment_fetch_failed");
  }
  return (await response.json()) as {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    method?: string;
  };
};