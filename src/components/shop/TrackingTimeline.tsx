import { Check, Circle, Loader2, XCircle } from "lucide-react";
import { ORDER_STEPS, isCancelled, isFailed, normalizeStatus, statusLabel, stepIndex } from "@/lib/orderStatus";
import { cn } from "@/lib/utils";

type Props = {
  status?: string | null;
  cancellationReason?: string | null;
  /** Optional timestamps keyed by canonical status, used to date completed steps. */
  timestamps?: Record<string, string>;
};

const fmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

/** Vertical, database-driven delivery timeline shared by tracking and order history. */
const TrackingTimeline = ({ status, cancellationReason, timestamps = {} }: Props) => {
  const s = normalizeStatus(status);

  if (isCancelled(s) || isFailed(s)) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
          <XCircle className="h-4 w-4" /> {statusLabel(s)}
        </div>
        {cancellationReason && <p className="text-xs text-muted-foreground mt-2">Reason: {cancellationReason}</p>}
      </div>
    );
  }

  const current = stepIndex(s);

  return (
    <ol className="relative">
      {ORDER_STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === ORDER_STEPS.length - 1;
        return (
          <li key={step.key} className="flex gap-3 pb-5 last:pb-0 relative">
            {!last && (
              <span
                className={cn(
                  "absolute left-[13px] top-7 bottom-0 w-px",
                  done || active ? "bg-gold/60" : "bg-border"
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "h-7 w-7 shrink-0 rounded-full border flex items-center justify-center z-[1] bg-background",
                done && "border-gold text-gold bg-gold/10",
                active && "border-gold text-gold bg-gold/20 ring-2 ring-gold/30",
                !done && !active && "border-border text-muted-foreground"
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5" />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Circle className="h-2.5 w-2.5" />
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm",
                  active ? "text-gold font-semibold" : done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {fmt(timestamps[step.key]) && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{fmt(timestamps[step.key])}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default TrackingTimeline;
