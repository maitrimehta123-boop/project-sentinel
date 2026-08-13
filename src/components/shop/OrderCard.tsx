import { Check, Circle, XCircle } from "lucide-react";
import { inr } from "@/lib/shop";
import { ORDER_STEPS, isCancelled, paymentLabel, statusLabel, stepIndex } from "@/lib/orderStatus";
import { cn } from "@/lib/utils";

export type OrderRow = {
  id: string;
  order_number: string | null;
  created_at: string;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  address: string | null;
  estimated_delivery: string | null;
  items: unknown;
};

type Item = { name: string; price: number; quantity: number; variant?: string | null };

const itemsOf = (items: unknown): Item[] => (Array.isArray(items) ? (items as Item[]) : []);

/** Customer-facing order summary with the delivery tracking timeline. */
const OrderCard = ({ order }: { order: OrderRow }) => {
  const cancelled = isCancelled(order.status);
  const current = stepIndex(order.status);

  return (
    <article className="lux-card rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Order</p>
          <h3 className="font-display text-lg sm:text-xl break-all">{order.order_number || order.id}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-xl">{inr(Number(order.total || 0))}</div>
          <div className="text-xs text-muted-foreground mt-1">Payment: {paymentLabel(order.payment_status)}</div>
          <span
            className={cn(
              "inline-block mt-2 text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full border",
              cancelled ? "border-destructive text-destructive" : "border-gold text-gold"
            )}
          >
            {statusLabel(order.status)}
          </span>
        </div>
      </div>

      {itemsOf(order.items).length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {itemsOf(order.items).map((it, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">
                {it.name} <span className="text-foreground/70">× {it.quantity}</span>
              </span>
              <span className="whitespace-nowrap">{inr(Number(it.price || 0) * Number(it.quantity || 1))}</span>
            </li>
          ))}
        </ul>
      )}

      {order.address && <p className="mt-3 text-xs text-muted-foreground">Ship to: {order.address}</p>}

      {/* Tracking timeline */}
      <div className="mt-6 pt-5 border-t border-border">
        {cancelled ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="h-4 w-4" /> {statusLabel(order.status)}
          </div>
        ) : (
          <ol className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
            {ORDER_STEPS.map((step, i) => {
              const done = i <= current;
              return (
                <li key={step.key} className="flex sm:flex-col sm:items-center sm:text-center items-center gap-3 sm:gap-2 flex-1 min-w-0">
                  <span
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center border flex-shrink-0",
                      done ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2.5 w-2.5" />}
                  </span>
                  <span className={cn("text-[11px] uppercase tracking-[0.12em]", done ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </article>
  );
};

export default OrderCard;
