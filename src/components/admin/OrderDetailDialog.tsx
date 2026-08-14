import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Loader2, StickyNote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inr } from "@/lib/shop";
import { ADMIN_STATUS_OPTIONS, canTransition, normalizeStatus, paymentLabel, statusLabel } from "@/lib/orderStatus";
import { itemsFromOrder, odb, type AdminOrderRow, type OrderItemRow, type StatusHistoryRow } from "@/lib/orders";
import { resolveImages } from "@/lib/productImages";

type Props = {
  order: AdminOrderRow | null;
  onClose: () => void;
  onChanged: () => void;
};

type NoteRow = { id: string; note: string; created_at: string };

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

const inputCls = "bg-background/40 border-gold/20";

const OrderDetailDialog = ({ order, onClose, onChanged }: Props) => {
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [history, setHistory] = useState<StatusHistoryRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [newNote, setNewNote] = useState("");
  const [status, setStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [reason, setReason] = useState("");
  const [ship, setShip] = useState({ courier_name: "", tracking_number: "", tracking_url: "", estimated_delivery_date: "", shipping_note: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!order) return;
    const [it, hi, no] = await Promise.all([
      odb.from("order_items").select("*").eq("order_id", order.id).order("created_at"),
      odb.from("order_status_history").select("*").eq("order_id", order.id).order("changed_at", { ascending: true }),
      odb.from("order_admin_notes").select("*").eq("order_id", order.id).order("created_at", { ascending: false }),
    ]);
    setItems(it.data?.length ? it.data : itemsFromOrder(order));
    setHistory(hi.data ?? []);
    setNotes(no.data ?? []);
  }, [order]);

  useEffect(() => {
    if (!order) return;
    setStatus(normalizeStatus(order.status));
    setStatusNote("");
    setReason(order.cancellation_reason ?? "");
    setShip({
      courier_name: order.courier_name ?? "",
      tracking_number: order.tracking_number ?? "",
      tracking_url: order.tracking_url ?? "",
      estimated_delivery_date: order.estimated_delivery_date ?? "",
      shipping_note: order.shipping_note ?? "",
    });
    load();
  }, [order, load]);

  if (!order) return null;
  const current = normalizeStatus(order.status);

  const saveStatus = async () => {
    if (status === current) return toast.info("Status unchanged");
    if (!canTransition(current, status)) return toast.error("That status change is not allowed.");
    setBusy(true);
    const { error } = await odb.rpc("admin_update_order_status", {
      p_order_id: order.id,
      p_status: status,
      p_note: statusNote.trim() || null,
      p_cancellation_reason: status === "cancelled" ? reason.trim() || null : null,
    });
    setBusy(false);
    if (error) return toast.error(error.message.includes("invalid_transition") ? "Invalid status transition." : error.message);
    toast.success(`Status updated to ${statusLabel(status)}`);
    setStatusNote("");
    onChanged();
    load();
  };

  const saveShipping = async () => {
    setBusy(true);
    const { error } = await odb.rpc("admin_update_order_shipping", {
      p_order_id: order.id,
      p_courier_name: ship.courier_name.trim() || null,
      p_tracking_number: ship.tracking_number.trim() || null,
      p_tracking_url: ship.tracking_url.trim() || null,
      p_estimated_delivery_date: ship.estimated_delivery_date || null,
      p_shipping_note: ship.shipping_note.trim() || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message.includes("invalid_tracking_url") ? "Tracking URL must start with http(s)://" : error.message);
    toast.success("Shipping details saved");
    onChanged();
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    const { error } = await odb.from("order_admin_notes").insert({ order_id: order.id, note: newNote.trim() });
    if (error) return toast.error(error.message);
    setNewNote("");
    toast.success("Internal note added");
    load();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-gold break-all">
            {order.order_number || order.id}
            <span className="ml-2 text-xs uppercase tracking-wider text-cosmic-silver/70">{statusLabel(order.status)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div className="glass-gold rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-widest text-gold mb-2">Customer</h4>
            <p>{order.customer_name}</p>
            <p className="text-muted-foreground break-all">{order.customer_email}</p>
            <p className="text-muted-foreground">{order.customer_phone}</p>
          </div>
          <div className="glass-gold rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-widest text-gold mb-2">Shipping Address</h4>
            <p className="text-muted-foreground">{order.address}</p>
            <p className="text-muted-foreground">{[order.city, order.state, order.pincode].filter(Boolean).join(", ")}</p>
          </div>
          <div className="glass-gold rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-widest text-gold mb-2">Payment</h4>
            <p className="text-muted-foreground">Method: {order.payment_method || "—"}</p>
            <p className="text-muted-foreground">Status: {paymentLabel(order.payment_status)}</p>
            <p className="text-muted-foreground break-all">Ref: {order.payment_id || order.payment_reference || order.razorpay_order_id || "—"}</p>
            <p className="mt-1">Paid: {inr(Number(order.total || 0))}</p>
          </div>
          <div className="glass-gold rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-widest text-gold mb-2">Totals</h4>
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(Number(order.subtotal || 0))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{inr(Number(order.shipping || 0))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{inr(Number(order.discount || 0))}</span></div>
            <div className="flex justify-between font-semibold text-gold"><span>Total</span><span>{inr(Number(order.total || 0))}</span></div>
          </div>
        </div>

        <div className="glass-gold rounded-xl p-4 mt-2">
          <h4 className="text-xs uppercase tracking-widest text-gold mb-3">Products</h4>
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <img src={resolveImages({ image_url: it.product_image } as any)[0]} alt={it.product_name} className="h-11 w-11 rounded object-cover border border-gold/20" />
                <span className="flex-1 min-w-0 truncate">{it.product_name}</span>
                <span className="text-muted-foreground">× {it.quantity}</span>
                <span className="w-20 text-right">{inr(Number(it.price || 0))}</span>
                <span className="w-24 text-right text-gold">{inr(Number(it.subtotal ?? Number(it.price) * it.quantity))}</span>
              </li>
            ))}
            {items.length === 0 && <li className="text-muted-foreground text-sm">No items recorded.</li>}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-2">
          <div className="glass-gold rounded-xl p-4 space-y-2">
            <h4 className="text-xs uppercase tracking-widest text-gold">Update Status</h4>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-9 rounded-md bg-background/60 border border-gold/30 px-2 text-sm">
              {ADMIN_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} disabled={s !== current && !canTransition(current, s)}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            {status === "cancelled" && (
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Cancellation reason" className={inputCls} />
            )}
            <Input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Note for this status change (optional)" className={inputCls} />
            <Button onClick={saveStatus} disabled={busy} className="w-full bg-gradient-gold text-primary-foreground">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Status"}
            </Button>
          </div>

          <div className="glass-gold rounded-xl p-4 space-y-2">
            <h4 className="text-xs uppercase tracking-widest text-gold">Shipping / Tracking</h4>
            <Input value={ship.courier_name} onChange={(e) => setShip({ ...ship, courier_name: e.target.value })} placeholder="Courier name" className={inputCls} />
            <Input value={ship.tracking_number} onChange={(e) => setShip({ ...ship, tracking_number: e.target.value })} placeholder="Tracking number" className={inputCls} />
            <Input value={ship.tracking_url} onChange={(e) => setShip({ ...ship, tracking_url: e.target.value })} placeholder="Tracking URL (https://…)" className={inputCls} />
            <Input type="date" value={ship.estimated_delivery_date ?? ""} onChange={(e) => setShip({ ...ship, estimated_delivery_date: e.target.value })} className={inputCls} />
            <Input value={ship.shipping_note} onChange={(e) => setShip({ ...ship, shipping_note: e.target.value })} placeholder="Shipping note (shown to customer)" className={inputCls} />
            <Button onClick={saveShipping} disabled={busy} variant="outline" className="w-full border-gold/40 text-gold">Save Shipping Details</Button>
            {order.tracking_url && (
              <a href={order.tracking_url} target="_blank" rel="noopener noreferrer nofollow" className="text-xs text-gold flex items-center gap-1">
                Open courier tracking <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-2">
          <div className="glass-gold rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-widest text-gold mb-3">Status History</h4>
            <ol className="space-y-2 text-sm">
              {history.map((h) => (
                <li key={h.id} className="border-l border-gold/30 pl-3">
                  <p className="text-foreground">{statusLabel(h.new_status)}</p>
                  <p className="text-[11px] text-muted-foreground">{fmt(h.changed_at)}{h.changed_by ? " · admin" : ""}</p>
                  {h.note && <p className="text-xs text-muted-foreground italic">{h.note}</p>}
                </li>
              ))}
              {history.length === 0 && <li className="text-muted-foreground">No history yet.</li>}
            </ol>
          </div>

          <div className="glass-gold rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-widest text-gold mb-3 flex items-center gap-2">
              <StickyNote className="h-3.5 w-3.5" /> Internal Notes
            </h4>
            <div className="flex gap-2">
              <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} maxLength={1000} placeholder="Visible to admins only…" className={`min-h-[38px] ${inputCls}`} />
              <Button onClick={addNote} className="bg-gradient-gold text-primary-foreground shrink-0">Add</Button>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {notes.map((n) => (
                <li key={n.id} className="text-muted-foreground">
                  <span className="text-foreground">{n.note}</span>
                  <span className="block text-[11px]">{fmt(n.created_at)}</span>
                </li>
              ))}
              {notes.length === 0 && <li className="text-muted-foreground">No internal notes.</li>}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
