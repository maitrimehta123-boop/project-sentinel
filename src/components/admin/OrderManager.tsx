import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import OrderDetailDialog from "@/components/admin/OrderDetailDialog";
import { inr } from "@/lib/shop";
import { ADMIN_STATUS_OPTIONS, canTransition, normalizeStatus, paymentLabel, statusLabel } from "@/lib/orderStatus";
import { odb, type AdminOrderRow } from "@/lib/orders";

const PAGE_SIZE = 15;
const BULK = ["processing", "packed", "shipped", "delivered"] as const;
const inputCls = "bg-background/40 border-gold/20";

const inRange = (iso: string, range: string, from: string, to: string) => {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") return d >= startOfToday;
  if (range === "yesterday") {
    const y = new Date(startOfToday); y.setDate(y.getDate() - 1);
    return d >= y && d < startOfToday;
  }
  if (range === "7d") { const s = new Date(startOfToday); s.setDate(s.getDate() - 6); return d >= s; }
  if (range === "30d") { const s = new Date(startOfToday); s.setDate(s.getDate() - 29); return d >= s; }
  if (range === "custom") {
    if (from && d < new Date(from)) return false;
    if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); if (d > end) return false; }
    return true;
  }
  return true;
};

/** Full admin order management: search, filter, bulk actions, export and tracking. */
const OrderManager = () => {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payFilter, setPayFilter] = useState("all");
  const [range, setRange] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkTarget, setBulkTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<AdminOrderRow | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await odb.from("orders").select("*").order("created_at", { ascending: false });
    if (err) setError("Unable to load orders. Please try again.");
    else { setError(null); setOrders(data ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // realtime: any order change refreshes the table
  useEffect(() => {
    const ch = odb.channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();
    return () => odb.removeChannel(ch);
  }, [load]);

  useEffect(() => { setPage(1); }, [q, statusFilter, payFilter, range, from, to, sort]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = orders.filter((o) => {
      if (t && ![o.order_number, o.customer_name, o.customer_email, o.customer_phone, o.tracking_number]
        .some((v) => String(v ?? "").toLowerCase().includes(t))) return false;
      if (statusFilter !== "all" && normalizeStatus(o.status) !== statusFilter) return false;
      if (payFilter !== "all" && (o.payment_status ?? "pending").toLowerCase() !== payFilter) return false;
      if (!inRange(o.created_at, range, from, to)) return false;
      return true;
    });
    return sort === "newest" ? list : [...list].reverse();
  }, [orders, q, statusFilter, payFilter, range, from, to, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allShownSelected = shown.length > 0 && shown.every((o) => selected.includes(o.id));

  const exportCSV = () => {
    const headers = ["Order Number", "Customer", "Email", "Phone", "Date", "Amount", "Payment Status", "Order Status", "Tracking Number"];
    const rows = filtered.map((o) => [
      o.order_number ?? o.id, o.customer_name, o.customer_email ?? "", o.customer_phone,
      new Date(o.created_at).toLocaleString("en-IN"), String(o.total), paymentLabel(o.payment_status),
      statusLabel(o.status), o.tracking_number ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const runBulk = async () => {
    if (!bulkTarget) return;
    setBusy(true);
    let ok = 0, skipped = 0;
    for (const id of selected) {
      const order = orders.find((o) => o.id === id);
      if (!order || !canTransition(order.status, bulkTarget)) { skipped++; continue; }
      const { error: err } = await odb.rpc("admin_update_order_status", {
        p_order_id: id, p_status: bulkTarget, p_note: "Bulk update", p_cancellation_reason: null,
      });
      err ? skipped++ : ok++;
    }
    setBusy(false); setBulkTarget(null); setSelected([]);
    toast.success(`${ok} order(s) updated${skipped ? `, ${skipped} skipped` : ""}`);
    load();
  };

  if (loading) return <div className="mt-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />)}</div>;
  if (error) return (
    <div className="mt-6 text-center py-10">
      <p className="text-destructive mb-4">{error}</p>
      <Button onClick={load} variant="outline" className="border-gold/40 text-gold"><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
    </div>
  );

  return (
    <div className="mt-6 space-y-4">
      <div className="glass-gold rounded-2xl p-4 space-y-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order no, name, email, phone, tracking" className={`lg:col-span-2 ${inputCls}`} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md bg-background/60 border border-gold/30 px-2 text-sm">
            <option value="all">All statuses</option>
            {ADMIN_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className="h-10 rounded-md bg-background/60 border border-gold/30 px-2 text-sm">
            <option value="all">All payments</option>
            {["pending", "paid", "failed", "refunded"].map((s) => <option key={s} value={s}>{paymentLabel(s)}</option>)}
          </select>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="h-10 rounded-md bg-background/60 border border-gold/30 px-2 text-sm">
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")} className="h-10 rounded-md bg-background/60 border border-gold/30 px-2 text-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          {range === "custom" && (
            <>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} aria-label="From date" />
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} aria-label="To date" />
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <span className="text-xs text-cosmic-silver/60">{filtered.length} order(s)</span>
          <div className="flex flex-wrap gap-2">
            {selected.length > 0 && BULK.map((s) => (
              <Button key={s} size="sm" variant="outline" className="border-gold/40 text-gold" onClick={() => setBulkTarget(s)}>
                Mark {statusLabel(s)}
              </Button>
            ))}
            <Button size="sm" onClick={exportCSV} className="bg-gradient-gold text-primary-foreground"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-cosmic-silver/60 py-10">Orders not found.</div>
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden lg:block overflow-x-auto glass-gold rounded-2xl">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-gold/80">
                <tr className="border-b border-gold/20">
                  <th className="p-3">
                    <Checkbox checked={allShownSelected} onCheckedChange={(v) =>
                      setSelected(v ? Array.from(new Set([...selected, ...shown.map((o) => o.id)])) : selected.filter((id) => !shown.some((o) => o.id === id)))} aria-label="Select page" />
                  </th>
                  {["Order", "Customer", "Date", "Items", "Total", "Payment", "Status", "Tracking", ""].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {shown.map((o) => (
                  <tr key={o.id} className="border-b border-border/40 hover:bg-gold/5">
                    <td className="p-3"><Checkbox checked={selected.includes(o.id)} onCheckedChange={(v) => setSelected(v ? [...selected, o.id] : selected.filter((i) => i !== o.id))} aria-label="Select order" /></td>
                    <td className="p-3 font-mono text-xs break-all">{o.order_number ?? o.id.slice(0, 8)}</td>
                    <td className="p-3"><div>{o.customer_name}</div><div className="text-xs text-cosmic-silver/60">{o.customer_phone}</div></td>
                    <td className="p-3 text-xs">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="p-3">{Array.isArray(o.items) ? (o.items as any[]).length : 0}</td>
                    <td className="p-3 text-gold">{inr(Number(o.total || 0))}</td>
                    <td className="p-3 text-xs">{paymentLabel(o.payment_status)}</td>
                    <td className="p-3 text-xs">{statusLabel(o.status)}</td>
                    <td className="p-3 text-xs break-all">{o.tracking_number || "—"}</td>
                    <td className="p-3"><Button size="sm" variant="outline" className="border-gold/40 text-gold" onClick={() => setActive(o)}>Manage</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="lg:hidden space-y-3">
            {shown.map((o) => (
              <div key={o.id} className="glass-gold rounded-2xl p-4">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selected.includes(o.id)} onCheckedChange={(v) => setSelected(v ? [...selected, o.id] : selected.filter((i) => i !== o.id))} aria-label="Select order" />
                      <span className="font-mono text-xs break-all">{o.order_number ?? o.id.slice(0, 8)}</span>
                    </div>
                    <div className="text-sm mt-1">{o.customer_name}</div>
                    <div className="text-xs text-cosmic-silver/60">{o.customer_phone}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-gold font-semibold">{inr(Number(o.total || 0))}</div>
                    <div className="text-[11px] text-cosmic-silver/60">{new Date(o.created_at).toLocaleDateString("en-IN")}</div>
                    <div className="text-[11px]">{paymentLabel(o.payment_status)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs uppercase tracking-wider text-gold">{statusLabel(o.status)}</span>
                  <Button size="sm" variant="outline" className="border-gold/40 text-gold" onClick={() => setActive(o)}>Manage</Button>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button size="sm" variant="outline" className="border-gold/40 text-gold" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-xs text-cosmic-silver/60">Page {page} of {pages}</span>
              <Button size="sm" variant="outline" className="border-gold/40 text-gold" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      <OrderDetailDialog
        order={active}
        onClose={() => setActive(null)}
        onChanged={() => { load(); setActive((a) => (a ? orders.find((o) => o.id === a.id) ?? a : a)); }}
      />

      <AlertDialog open={!!bulkTarget} onOpenChange={(o) => !o && setBulkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update {selected.length} order(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Every selected order that allows the change will move to “{bulkTarget ? statusLabel(bulkTarget) : ""}”. A history entry is recorded for each.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); runBulk(); }} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderManager;
