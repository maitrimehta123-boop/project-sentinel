import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { inr } from "@/lib/shop";
import { NEEDS_ACTION, normalizeStatus, statusLabel } from "@/lib/orderStatus";
import { odb, type AdminOrderRow, type StatusHistoryRow } from "@/lib/orders";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "all", label: "All Time" },
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const within = (iso: string, range: string, from: string, to: string) => {
  const d = new Date(iso);
  const today = startOfDay(new Date());
  if (range === "today") return d >= today;
  if (range === "yesterday") { const y = new Date(today); y.setDate(y.getDate() - 1); return d >= y && d < today; }
  if (range === "7d") { const s = new Date(today); s.setDate(s.getDate() - 6); return d >= s; }
  if (range === "30d") { const s = new Date(today); s.setDate(s.getDate() - 29); return d >= s; }
  if (range === "custom") {
    if (from && d < new Date(from)) return false;
    if (to) { const e = new Date(to); e.setHours(23, 59, 59, 999); if (d > e) return false; }
    return true;
  }
  return true;
};

/** KPI + chart overview driven entirely by real order data. */
const OrdersDashboard = () => {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [history, setHistory] = useState<(StatusHistoryRow & { order_id: string })[]>([]);
  const [range, setRange] = useState("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [o, h] = await Promise.all([
        odb.from("orders").select("*").order("created_at", { ascending: false }),
        odb.from("order_status_history").select("*").order("changed_at", { ascending: false }).limit(10),
      ]);
      if (!alive) return;
      setOrders(o.data ?? []);
      setHistory(h.data ?? []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const scoped = useMemo(() => orders.filter((o) => within(o.created_at, range, from, to)), [orders, range, from, to]);

  const kpis = useMemo(() => {
    const by = (s: string) => scoped.filter((o) => normalizeStatus(o.status) === s).length;
    return {
      total: scoped.length,
      pending: scoped.filter((o) => NEEDS_ACTION.includes(normalizeStatus(o.status))).length,
      processing: by("processing"),
      shipped: by("shipped") + by("out_for_delivery"),
      delivered: by("delivered"),
      cancelled: by("cancelled") + by("refunded"),
      revenue: scoped.filter((o) => (o.payment_status ?? "").toLowerCase() === "paid").reduce((s, o) => s + Number(o.total || 0), 0),
    };
  }, [scoped]);

  const daily = useMemo(() => {
    const map = new Map<string, { day: string; orders: number; revenue: number }>();
    scoped.forEach((o) => {
      const key = new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const row = map.get(key) ?? { day: key, orders: 0, revenue: 0 };
      row.orders += 1;
      if ((o.payment_status ?? "").toLowerCase() === "paid") row.revenue += Number(o.total || 0);
      map.set(key, row);
    });
    return [...map.values()].reverse();
  }, [scoped]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    scoped.forEach((o) => { const s = statusLabel(o.status); map.set(s, (map.get(s) ?? 0) + 1); });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [scoped]);

  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    scoped.forEach((o) => { const s = (o.payment_status ?? "pending").toLowerCase(); map.set(s, (map.get(s) ?? 0) + 1); });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [scoped]);

  if (loading) return <div className="h-40 rounded-2xl bg-secondary animate-pulse mt-6" />;

  const cards = [
    { label: "Total Orders", value: kpis.total },
    { label: "Pending", value: kpis.pending },
    { label: "Processing", value: kpis.processing },
    { label: "Shipped", value: kpis.shipped },
    { label: "Delivered", value: kpis.delivered },
    { label: "Cancelled", value: kpis.cancelled },
    { label: "Revenue", value: inr(kpis.revenue) },
  ];

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button key={r.key} onClick={() => setRange(r.key)}
            className={`text-xs px-3 py-1.5 rounded-full border ${range === r.key ? "border-gold text-gold bg-gold/10" : "border-border text-cosmic-silver/70"}`}>
            {r.label}
          </button>
        ))}
        <button onClick={() => setRange("custom")}
          className={`text-xs px-3 py-1.5 rounded-full border ${range === "custom" ? "border-gold text-gold bg-gold/10" : "border-border text-cosmic-silver/70"}`}>
          Custom
        </button>
        {range === "custom" && (
          <span className="flex gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 rounded-md bg-background/60 border border-gold/30 px-2 text-xs" aria-label="From" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 rounded-md bg-background/60 border border-gold/30 px-2 text-xs" aria-label="To" />
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="glass-gold rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-gold">{c.value}</div>
            <div className="text-[11px] text-cosmic-silver/70 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-gold rounded-2xl p-4">
          <h4 className="text-xs uppercase tracking-widest text-gold mb-3">Orders by day</h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" fontSize={10} /><YAxis fontSize={10} allowDecimals={false} />
                <Tooltip /><Line type="monotone" dataKey="orders" stroke="#C9A227" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-gold rounded-2xl p-4">
          <h4 className="text-xs uppercase tracking-widest text-gold mb-3">Revenue by day</h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" fontSize={10} /><YAxis fontSize={10} />
                <Tooltip /><Bar dataKey="revenue" fill="#C9A227" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-gold rounded-2xl p-4">
          <h4 className="text-xs uppercase tracking-widest text-gold mb-3">Orders by status</h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" fontSize={10} allowDecimals={false} />
                <YAxis type="category" dataKey="name" fontSize={10} width={110} />
                <Tooltip /><Bar dataKey="value" fill="#C9A227" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-gold rounded-2xl p-4">
          <h4 className="text-xs uppercase tracking-widest text-gold mb-3">Payment status</h4>
          <ul className="text-sm space-y-1">
            {byPayment.map((p) => (
              <li key={p.name} className="flex justify-between"><span className="capitalize text-cosmic-silver/70">{p.name}</span><span className="text-gold">{p.value}</span></li>
            ))}
            {byPayment.length === 0 && <li className="text-cosmic-silver/60">No orders in this period.</li>}
          </ul>
          <h4 className="text-xs uppercase tracking-widest text-gold mt-4 mb-2">Recent status changes</h4>
          <ul className="text-xs space-y-1">
            {history.slice(0, 6).map((h) => (
              <li key={h.id} className="text-cosmic-silver/70">
                {statusLabel(h.new_status)} · {new Date(h.changed_at).toLocaleString("en-IN")}
              </li>
            ))}
            {history.length === 0 && <li className="text-cosmic-silver/60">No changes recorded yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;
