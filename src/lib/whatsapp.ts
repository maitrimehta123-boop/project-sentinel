export const WHATSAPP_NUMBER = "919558565655";
export const PHONE_NUMBER = "+91 9558565655";
export const EMAIL = "astrowithhrishi@gmail.com";
export const ADDRESS = "1st Floor, M.K. Square, beside Bhidbhanjan Hanuman Mandir, opposite Harni Talav, Vadodara, Gujarat 390022";

export const waLink = (message: string, number = WHATSAPP_NUMBER) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const openWhatsApp = (message: string, number = WHATSAPP_NUMBER) => {
  window.open(waLink(message, number), "_blank");
};

const digits = (phone: string) => {
  const d = (phone || "").replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  return d;
};

export type WaOrder = {
  order_number: string | null;
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  items: { name: string; price: number; quantity: number; variant?: string | null }[];
  total: number;
  payment_method: string | null;
  payment_status: string;
  transaction_id: string | null;
  created_at: string;
};

const money = (n: number) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

/** Confirmation message sent to the customer's WhatsApp. */
export const customerOrderMessage = (o: WaOrder) =>
  `Hello ${o.customer_name},

Thank you for shopping with *Astro With Hrishi*.

*Order ID:* ${o.order_number ?? o.id}
*Amount:* ${money(o.total)}
*Payment Status:* ${o.payment_status === "paid" ? "Successful" : o.payment_status}

We have received your order.
Your order is now being processed. 🙏`;

/** Full order alert sent to the store owner's WhatsApp. */
export const ownerOrderMessage = (o: WaOrder) => {
  const d = new Date(o.created_at);
  const items = o.items
    .map((i) => `• ${i.name}${i.variant ? ` (${i.variant})` : ""} × ${i.quantity} — ${money(i.price * i.quantity)}`)
    .join("\n");
  return `🛒 *NEW ORDER RECEIVED*

*Order ID:* ${o.order_number ?? o.id}
*Date:* ${d.toLocaleDateString("en-IN")}
*Time:* ${d.toLocaleTimeString("en-IN")}

*Customer:* ${o.customer_name}
*Mobile:* ${o.customer_phone}
*Email:* ${o.customer_email ?? "—"}

*Address:*
${o.address}
${[o.city, o.state, o.pincode].filter(Boolean).join(", ")}
${o.country ?? "India"}

*Items:*
${items}

*Amount:* ${money(o.total)}
*Payment Method:* ${(o.payment_method ?? "—").toUpperCase()}
*Payment Status:* ${o.payment_status === "paid" ? "Successful" : o.payment_status}
*Transaction ID:* ${o.transaction_id ?? "—"}`;
};

export const customerWaLink = (o: WaOrder) => waLink(customerOrderMessage(o), digits(o.customer_phone));
export const ownerWaLink = (o: WaOrder) => waLink(ownerOrderMessage(o));
