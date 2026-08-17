import { inr } from "@/lib/shop";
import { ADDRESS, EMAIL, PHONE_NUMBER } from "@/lib/whatsapp";

export type ReceiptItem = {
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string | null;
};

export type ReceiptData = {
  order_number: string | null;
  order_id: string;
  payment_id: string | null;
  payment_method: string | null;
  payment_status: string;
  paid_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  gst: number;
  total: number;
};

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const absolute = (src: string) => (/^https?:/i.test(src) ? src : `${window.location.origin}${src.startsWith("/") ? "" : "/"}${src}`);

/** A4-friendly order confirmation receipt — no site chrome, only the order. */
export const receiptHtml = (o: ReceiptData) => {
  const rows = o.items
    .map(
      (i, n) => `<tr>
        <td>${n + 1}</td>
        <td class="prod">
          <img src="${esc(absolute(i.image))}" alt="${esc(i.name)}" />
          <div><strong>${esc(i.name)}</strong>${i.variant ? `<div class="muted">${esc(i.variant)}</div>` : ""}</div>
        </td>
        <td class="r">${esc(inr(i.price))}</td>
        <td class="r">${esc(i.quantity)}</td>
        <td class="r">${esc(inr(i.price * i.quantity))}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Order Confirmation ${esc(o.order_number ?? o.order_id)}</title>
<style>
  *{box-sizing:border-box} body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;margin:0;padding:28px;background:#fff}
  .wrap{max-width:780px;margin:0 auto;border:1px solid #e6d9b8;padding:30px;border-radius:10px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:2px solid #c9a227;padding-bottom:16px;margin-bottom:22px}
  .brand{display:flex;gap:12px;align-items:center}
  .brand img{height:52px;width:52px;object-fit:contain;border-radius:8px}
  h1{font-size:22px;margin:0;color:#8a6d1b;letter-spacing:1px}
  h2{font-size:13px;margin:0 0 8px;color:#8a6d1b;text-transform:uppercase;letter-spacing:2px}
  .muted{color:#666;font-size:12px}
  .grid{display:flex;gap:28px;margin-bottom:20px;flex-wrap:wrap}
  .grid>div{flex:1;min-width:210px}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:14px}
  th{background:#faf5e6;text-align:left;padding:9px;border-bottom:2px solid #e6d9b8;font-size:11px;text-transform:uppercase;letter-spacing:1px}
  td{padding:9px;border-bottom:1px solid #f0e8d2;vertical-align:middle}
  .prod{display:flex;gap:10px;align-items:center}
  .prod img{height:46px;width:46px;object-fit:cover;border-radius:6px;border:1px solid #e6d9b8}
  .r{text-align:right}
  .totals{margin-top:16px;margin-left:auto;width:290px;font-size:14px}
  .totals div{display:flex;justify-content:space-between;padding:5px 0}
  .totals .grand{border-top:2px solid #c9a227;margin-top:6px;padding-top:10px;font-weight:bold;font-size:17px;color:#8a6d1b}
  .badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;text-transform:uppercase;letter-spacing:1px;background:#e8f7ee;color:#12703a}
  footer{margin-top:28px;border-top:1px solid #e6d9b8;padding-top:14px;text-align:center;color:#777;font-size:12px}
  @media print{body{padding:0}.wrap{border:none}}
</style></head><body><div class="wrap">
  <div class="head">
    <div class="brand">
      <img src="${esc(absolute("/assets/brand-logo.jpg"))}" alt="Astro With Hrishi" />
      <div>
        <h1>ASTRO WITH HRISHI</h1>
        <div class="muted">${esc(ADDRESS)}</div>
        <div class="muted">${esc(PHONE_NUMBER)} &nbsp;•&nbsp; ${esc(EMAIL)}</div>
      </div>
    </div>
    <div style="text-align:right">
      <h2>Order Confirmation</h2>
      <div><strong>${esc(o.order_number ?? o.order_id.slice(0, 8).toUpperCase())}</strong></div>
      <div class="muted">${esc(new Date(o.paid_at).toLocaleString("en-IN"))}</div>
      <div style="margin-top:8px"><span class="badge">${esc(o.payment_status)}</span></div>
    </div>
  </div>

  <div class="grid">
    <div>
      <h2>Shipping To</h2>
      <div><strong>${esc(o.customer_name)}</strong></div>
      <div class="muted">${esc(o.address)}</div>
      <div class="muted">${esc([o.city, o.state, o.pincode].filter(Boolean).join(", "))}, India</div>
      <div class="muted">${esc(o.customer_phone)}${o.customer_email ? ` • ${esc(o.customer_email)}` : ""}</div>
    </div>
    <div>
      <h2>Payment</h2>
      <div class="muted">Status: <strong>${esc(o.payment_status)}</strong></div>
      <div class="muted">Method: <strong>${esc((o.payment_method ?? "razorpay").toUpperCase())}</strong></div>
      <div class="muted">Payment ID: ${esc(o.payment_id ?? "—")}</div>
      <div class="muted">Paid on: ${esc(new Date(o.paid_at).toLocaleString("en-IN"))}</div>
    </div>
  </div>

  <table>
    <thead><tr><th>#</th><th>Product</th><th class="r">Unit Price</th><th class="r">Qty</th><th class="r">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${esc(inr(o.subtotal))}</span></div>
    ${o.discount > 0 ? `<div><span>Discount</span><span>- ${esc(inr(o.discount))}</span></div>` : ""}
    <div><span>Shipping</span><span>${o.shipping > 0 ? esc(inr(o.shipping)) : "FREE"}</span></div>
    <div><span>GST (3%)</span><span>${esc(inr(o.gst))}</span></div>
    <div class="grand"><span>Total Paid</span><span>${esc(inr(o.total))}</span></div>
  </div>

  <footer>Thank you for your order! 🙏<br/>This is a computer-generated confirmation and does not require a signature.</footer>
</div></body></html>`;
};

const openReceiptWindow = (o: ReceiptData) => {
  const html = receiptHtml(o);
  const win = window.open("", "_blank", "width=880,height=920");
  if (!win) return null;
  win.document.write(html);
  win.document.close();
  win.focus();
  return win;
};

/** Print-friendly receipt in a clean window (site UI is never printed). */
export const printReceipt = (o: ReceiptData) => {
  const win = openReceiptWindow(o);
  if (!win) return downloadReceipt(o);
  setTimeout(() => win.print(), 500);
};

/** Saves the same receipt as a file the customer can keep or print to PDF. */
export const downloadReceipt = (o: ReceiptData) => {
  const blob = new Blob([receiptHtml(o)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `order-${o.order_number ?? o.order_id}.html`;
  a.click();
  URL.revokeObjectURL(url);
};
