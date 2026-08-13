/** Trusted server-side price list. Mirrors src/lib/catalog.ts. */
export const CATALOG_PRICES: Record<string, { name: string; price: number }> = {
  "trishield-bracelet": { name: "Trishield Bracelet", price: 750 },
  "chakra-tree": { name: "7 Chakra Crystal Tree", price: 860 },
  "ranga-dhatu-sarp-set": { name: "Ranga Dhatu Sarp Set", price: 1950 },
  "moonstone-bracelet": { name: "Moonstone Bracelet", price: 750 },
  "rose-quartz-bracelet": { name: "Rose Quartz Bracelet", price: 600 },
  "pyrite-bracelet": { name: "Pyrite Bracelet", price: 750 },
  "sunstone-bracelet": { name: "Sunstone Bracelet", price: 750 },
  "carnelian-bracelet": { name: "Carnelian Bracelet", price: 750 },
  "tiger-eye-bracelet": { name: "Tiger Eye Bracelet", price: 750 },
  "7-chakra-black-tourmaline-bracelet": { name: "7 Chakra Black Tourmaline Bracelet", price: 650 },
  "dhanyog-bracelet": { name: "Dhanyog Bracelet", price: 750 },
};

/** Must mirror src/lib/shop.ts */
export const shippingFor = (subtotal: number) => (subtotal >= 999 || subtotal === 0 ? 0 : 79);
export const gstFor = (subtotal: number) => Math.round(subtotal * 0.03);
export const orderTotalFor = (subtotal: number) =>
  Math.round(subtotal) + shippingFor(subtotal) + gstFor(subtotal);
