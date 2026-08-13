/** Shared order status vocabulary for the customer tracking view and the admin panel. */

export const ORDER_STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "paid", label: "Payment Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
] as const;

/** Statuses an admin can set from the panel (kept compatible with payment-gateway values). */
export const ADMIN_STATUS_OPTIONS = [
  "PENDING_PAYMENT",
  "PAID",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "CANCELLED",
  "REFUNDED",
] as const;

const NORMALISED: Record<string, number> = {
  pending_payment: 0,
  payment_failed: 0,
  created: 0,
  payment_authenticated: 1,
  paid: 1,
  confirmed: 1,
  processing: 2,
  packed: 2,
  shipped: 3,
  out_for_delivery: 4,
  delivered: 5,
};

export const isCancelled = (status?: string | null) => {
  const s = (status ?? "").toLowerCase();
  return s === "cancelled" || s === "canceled" || s === "refunded";
};

/** Index into ORDER_STEPS for the current status (-1 when cancelled/unknown). */
export const stepIndex = (status?: string | null) => {
  const s = (status ?? "").toLowerCase();
  if (isCancelled(s)) return -1;
  return NORMALISED[s] ?? 0;
};

export const statusLabel = (status?: string | null) => {
  const s = (status ?? "").toLowerCase();
  if (s === "refunded") return "Refunded";
  if (isCancelled(s)) return "Cancelled";
  if (s === "payment_failed") return "Payment Failed";
  const i = stepIndex(s);
  return ORDER_STEPS[i]?.label ?? "Order Placed";
};

export const paymentLabel = (paymentStatus?: string | null) => {
  const s = (paymentStatus ?? "pending").toLowerCase();
  if (s === "paid" || s === "captured" || s === "success") return "Paid";
  if (s === "failed") return "Failed";
  if (s === "refunded") return "Refunded";
  return "Pending";
};
