/** Trusted server-side pricing rules — mirrors src/lib/shop.ts. */
export const shippingFor = (subtotal: number) => (subtotal >= 999 || subtotal === 0 ? 0 : 79);
export const gstFor = (subtotal: number) => Math.round(subtotal * 0.03);

export type CouponRow = {
  code: string;
  discount_type: string;
  discount_value: number;
  min_order: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

export const couponDiscount = (coupon: CouponRow | null, subtotal: number) => {
  if (!coupon || !coupon.active) return 0;
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return 0;
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) return 0;
  if (subtotal < Number(coupon.min_order)) return 0;
  const raw =
    coupon.discount_type === "percent"
      ? (subtotal * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);
  const capped = coupon.max_discount ? Math.min(raw, Number(coupon.max_discount)) : raw;
  return Math.min(Math.round(capped), subtotal);
};
