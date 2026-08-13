export type DBProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null;
  category: string | null;
  stock: number;
  active: boolean;
  discount_percent: number;
  variants: { name: string; options: string[] }[] | null;
  sku: string | null;
  badge: string | null;
  rating: number;
  review_count: number;
  sort_order: number;
  featured?: boolean;
  created_at: string;
};

export const inr = (n: number) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

/** Strike-through MRP derived from the product's discount percentage. */
export const mrpOf = (price: number, discount: number) =>
  discount > 0 ? Math.round(price / (1 - discount / 100)) : Math.round(price * 1.3);

export const shippingFor = (subtotal: number) => (subtotal >= 999 || subtotal === 0 ? 0 : 79);
export const gstFor = (subtotal: number) => Math.round(subtotal * 0.03);

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

export const couponDiscount = (coupon: Coupon | null, subtotal: number) => {
  if (!coupon || subtotal < Number(coupon.min_order)) return 0;
  const raw =
    coupon.discount_type === "percent"
      ? (subtotal * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);
  const capped = coupon.max_discount ? Math.min(raw, Number(coupon.max_discount)) : raw;
  return Math.min(Math.round(capped), subtotal);
};

export const deliveryEstimate = (days = 6) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", hint: "GPay · PhonePe · Paytm · BHIM" },
  { id: "card", label: "Credit / Debit Card", hint: "Visa · Mastercard · RuPay · Amex" },
  { id: "netbanking", label: "Net Banking", hint: "All major Indian banks" },
  { id: "wallet", label: "Wallet", hint: "Paytm · Amazon Pay · Mobikwik" },
  { id: "cod", label: "Cash on Delivery", hint: "Pay when your order arrives" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];
