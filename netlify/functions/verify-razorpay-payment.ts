import { json, preflight, type FunctionEvent } from "./_shared/payment.js";

const env = (name: string) => process.env[name]?.trim() ?? "";

export const handler = async (event: FunctionEvent) => {
  const optionsResponse = preflight(event);
  if (optionsResponse) return optionsResponse;
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const authorization = event.headers.authorization ?? event.headers.Authorization ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return json(401, { error: "Please sign in to continue." });
  }

  try {
    const supabaseUrl = env("SUPABASE_URL") || env("VITE_SUPABASE_URL");
    const supabaseAnonKey =
      env("SUPABASE_ANON_KEY") || env("VITE_SUPABASE_PUBLISHABLE_KEY") || env("VITE_SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return json(503, { error: "Payment service is not configured." });
    }

    // Netlify is only a thin authenticated proxy. Signature verification,
    // Razorpay API calls and database writes remain server-side in Supabase.
    const response = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/functions/v1/verify-razorpay-payment`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          apikey: supabaseAnonKey,
          "Content-Type": "application/json",
        },
        body: event.body ?? "{}",
      },
    );

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return json(502, { error: "Payment service returned an invalid response." });
    }

    const payload = await response.json().catch(() => null);
    if (!payload) return json(502, { error: "Payment service returned an invalid response." });
    return json(response.status, payload);
  } catch (error) {
    console.error(
      "verify_razorpay_payment_proxy_error",
      error instanceof Error ? error.message : "unknown",
    );
    return json(502, { error: "Could not verify the payment. Please try again." });
  }
};
