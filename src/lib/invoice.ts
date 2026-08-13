import { inr } from "@/lib/shop";
import { ADDRESS, EMAIL, PHONE_NUMBER } from "@/lib/whatsapp";

export type InvoiceOrder = {
  order_number: string | null;
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  items: { name: string; price: number; quantity: number; variant?: string | null }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon_code: string | null;
  payment_method: string | null;
  payment_status: string;
  transaction_id: string | null;
  status: string;
};

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export const invoiceHtml = (o: InvoiceOrder) => {
  const rows = (o.items ?? [])
    .map(
      (i, n) => `<tr>
        <td>${n + 1}</td>
        <td>${esc(i.name)}${i.variant ? `<div class="muted">${esc(i.variant)}</div>` : ""}</td>
        <td class="r">${esc(inr(i.price))}</td>
        <td class="r">${esc(i.quantity)}</td>
        <td class="r">${esc(inr(i.price * i.quantity))}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8" />
<title>Invoice ${esc(o.order_number ?? o.id)}</title>
<style>
  *{box-sizing:border-box} body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;margin:0;padding:32px;background:#fff}
  .wrap{max-width:760px;margin:0 auto;border:1px solid #e6d9b8;padding:32px;border-radius:10px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #c9a227;padding-bottom:16px;margin-bottom:24px}
  h1{font-size:26px;margin:0;color:#8a6d1b;letter-spacing:1px}
  h2{font-size:15px;margin:0 0 8px;color:#8a6d1b;text-transform:uppercase;letter-spacing:2px}
  .muted{color:#666;font-size:12px}
  .grid{display:flex;gap:32px;margin-bottom:24px;flex-wrap:wrap}
  .grid>div{flex:1;min-width:220px}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:14px}
  th{background:#faf5e6;text-align:left;padding:10px;border-bottom:2px solid #e6d9b8;font-size:12px;text-transform:uppercase;letter-spacing:1px}
  td{padding:10px;border-bottom:1px solid #f0e8d2}
  .r{text-align:right}
  .totals{margin-top:16px;margin-left:auto;width:280px;font-size:14px}
  .totals div{display:flex;justify-content:space-between;padding:6px 0}
  .totals .grand{border-top:2px solid #c9a227;margin-top:6px;padding-top:10px;font-weight:bold;font-size:17px;color:#8a6d1b}
  .badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;text-transform:uppercase;letter-spacing:1px;background:#e8f7ee;color:#12703a}
  footer{margin-top:32px;border-top:1px solid #e6d9b8;padding-top:14px;text-align:center;color:#777;font-size:12px}
  @media print{body{padding:0}.wrap{border:none}}
</style></head><body><div class="wrap">
  <div class="head">
    <div>
      <h1>ASTRO WITH HRISHI</h1>
      <div class="muted">${esc(ADDRESS)}</div>
      <div class="muted">${esc(PHONE_NUMBER)} &nbsp;•&nbsp; ${esc(EMAIL)}</div>
    </div>
    <div style="text-align:right">
      <h2>Tax Invoice</h2>
      <div><strong>${esc(o.order_number ?? o.id.slice(0, 8).toUpperCase())}</strong></div>
      <div class="muted">${new Date(o.created_at).toLocaleString("en-IN")}</div>
      <div style="margin-top:8px"><span class="badge">${esc(o.payment_status)}</span></div>
    </div>
  </div>

  <div class="grid">
    <div>
      <h2>Billed To</h2>
      <div><strong>${esc(o.customer_name)}</strong></div>
      <div class="muted">${esc(o.address)}</div>
      <div class="muted">${esc([o.city, o.state, o.pincode].filter(Boolean).join(", "))}</div>
      <div class="muted">${esc(o.country ?? "India")}</div>
      <div class="muted">${esc(o.customer_phone)}${o.customer_email ? ` • ${esc(o.customer_email)}` : ""}</div>
    </div>
    <div>
      <h2>Payment</h2>
      <div class="muted">Method: <strong>${esc((o.payment_method ?? "—").toUpperCase())}</strong></div>
      <div class="muted">Status: <strong>${esc(o.payment_status)}</strong></div>
      <div class="muted">Transaction ID: ${esc(o.transaction_id ?? "—")}</div>
      <div class="muted">Order Status: ${esc(o.status)}</div>
    </div>
  </div>

  <table>
    <thead><tr><th>#</th><th>Item</th><th class="r">Price</th><th class="r">Qty</th><th class="r">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${esc(inr(o.subtotal))}</span></div>
    ${o.discount > 0 ? `<div><span>Discount ${o.coupon_code ? `(${esc(o.coupon_code)})` : ""}</span><span>- ${esc(inr(o.discount))}</span></div>` : ""}
    <div><span>Shipping</span><span>${o.shipping > 0 ? esc(inr(o.shipping)) : "FREE"}</span></div>
    <div class="grand"><span>Total Paid</span><span>${esc(inr(o.total))}</span></div>
  </div>

  <footer>Thank you for shopping with Astro With Hrishi 🙏<br/>This is a computer-generated invoice and does not require a signature.</footer>
</div></body></html>`;
};

/** Opens a printable invoice window (Print → Save as PDF). */
export const downloadInvoice = (order: InvoiceOrder) => {
  const html = invoiceHtml(order);
  const win = window.open("", "_blank", "width=860,height=900");
  if (!win) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.order_number ?? order.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
};
