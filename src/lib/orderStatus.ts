/** Shared order status vocabulary for tracking, order history and the admin panel. */

export const ORDER_STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "payment_confirmed", label: "Payment Confirmed" },
  { key: "confirmed", label: "Order Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
] as const;

/** Every status an admin may set (mirrors admin_update_order_status in the database). */
export const ADMIN_STATUS_OPTIONS = [
  "placed",
  "payment_confirmed",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "payment_failed",
  "refund_initiated",
  "refunded",
] as const;

export type OrderStatus = (typeof ADMIN_STATUS_OPTIONS)[number];

const LEGACY: Record<string, OrderStatus> = {
  pending_payment: "placed",
  created: "placed",
  paid: "payment_confirmed",
  payment_authenticated: "payment_confirmed",
  canceled: "cancelled",
};

/** Maps legacy gateway values onto the canonical lifecycle (mirrors the SQL function). */
export const normalizeStatus = (status?: string | null): string => {
  const s = (status ?? "").toLowerCase().trim();
  if (!s) return "placed";
  return LEGACY[s] ?? s;
};

const SPECIAL_LABELS: Record<string, string> = {
  cancelled: "Cancelled",
  payment_failed: "Payment Failed",
  refund_initiated: "Refund Initiated",
  refunded: "Refunded",
};

export const isCancelled = (status?: string | null) => {
  const s = normalizeStatus(status);
  return s === "cancelled" || s === "refunded" || s === "refund_initiated";
};

export const isFailed = (status?: string | null) => normalizeStatus(status) === "payment_failed";

/** Index into ORDER_STEPS for the current status (-1 when cancelled/failed). */
export const stepIndex = (status?: string | null) => {
  const s = normalizeStatus(status);
  if (SPECIAL_LABELS[s]) return -1;
  const i = ORDER_STEPS.findIndex((step) => step.key === s);
  return i === -1 ? 0 : i;
};

export const statusLabel = (status?: string | null) => {
  const s = normalizeStatus(status);
  return SPECIAL_LABELS[s] ?? ORDER_STEPS[stepIndex(s)]?.label ?? "Order Placed";
};

export const paymentLabel = (paymentStatus?: string | null) => {
  const s = (paymentStatus ?? "pending").toLowerCase();
  if (s === "paid" || s === "captured" || s === "success") return "Paid";
  if (s === "failed") return "Failed";
  if (s === "refunded") return "Refunded";
  return "Pending";
};

/** Client-side mirror of the database transition rules (the DB is the real gate). */
export const canTransition = (from?: string | null, to?: string) => {
  const a = normalizeStatus(from);
  const b = normalizeStatus(to);
  if (a === b) return false;
  if (a === "refunded") return false;
  if (a === "cancelled" || a === "delivered") return b === "refund_initiated" || b === "refunded";
  const ra = stepIndex(a);
  const rb = ORDER_STEPS.findIndex((s) => s.key === b);
  if (!SPECIAL_LABELS[a] && rb !== -1 && rb < ra) return false;
  return true;
};

/** Statuses that still need admin attention. */
export const NEEDS_ACTION = ["placed", "payment_confirmed", "confirmed", "processing", "packed"];
