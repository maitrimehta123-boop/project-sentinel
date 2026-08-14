import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ExternalLink, PackageSearch, RefreshCw, Truck } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TrackingTimeline from "@/components/shop/TrackingTimeline";
import { inr } from "@/lib/shop";
import { normalizeStatus, paymentLabel, statusLabel } from "@/lib/orderStatus";
import { odb, trackOrderLookup, type TrackedOrder } from "@/lib/orders";
import { resolveImages } from "@/lib/productImages";

const ERRORS: Record<string, string> = {
  invalid_input: "Please enter your order number and the email or mobile used at checkout.",
  not_found: "Invalid order number or customer details. Please check and try again.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  server: "Unable to load order. Please try again.",
};

const TrackOrder = () => {
  const [params, setParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const creds = useRef<{ n: string; c: string } | null>(null);

  const lookup = useCallback(async (n: string, c: string, silent = false) => {
    if (!silent) setLoading(true);
    const { data, error: err } = await trackOrderLookup(n.trim(), c.trim());
    if (!silent) setLoading(false);
    if (err) {
      if (!silent) {
        setError(ERRORS[err] ?? ERRORS.server);
        setResult(null);
      }
      return;
    }
    setError(null);
    setResult(data);
    creds.current = { n: n.trim(), c: c.trim() };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !contact.trim()) return setError(ERRORS.invalid_input);
    setParams(orderNumber.trim() ? { order: orderNumber.trim() } : {}, { replace: true });
    lookup(orderNumber, contact);
  };

  // Live updates: realtime for signed-in owners, short polling for everyone else.
  useEffect(() => {
    if (!result) return;
    const id = result.order.id;
    const refresh = () => creds.current && lookup(creds.current.n, creds.current.c, true);
    const channel = odb
      .channel(`order-track-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, refresh)
      .subscribe();
    const timer = window.setInterval(refresh, 15000);
    return () => {
      window.clearInterval(timer);
      odb.removeChannel(channel);
    };
  }, [result?.order.id, lookup]); // eslint-disable-line react-hooks/exhaustive-deps

  const o = result?.order;
  const timestamps: Record<string, string> = {};
  (result?.history ?? []).forEach((h) => {
    timestamps[normalizeStatus(h.new_status)] = h.changed_at;
  });

  return (
    <PageLayout title="Track Your Order" subtitle="Enter your order number to see exactly where your parcel is.">
      <SEO
        title="Track Your Order — Astro With Hrishi"
        description="Track the live status of your Astro With Hrishi order with your order number and registered email or mobile."
        path="/track-order"
      />
      <div className="container max-w-3xl">
        <form onSubmit={submit} className="lux-card rounded-2xl p-5 sm:p-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order number (ORD-XXXXXXXX)"
            maxLength={40}
            aria-label="Order number"
            className="bg-background/40 border-gold/20"
          />
          <Input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or mobile number"
            maxLength={120}
            aria-label="Email or mobile number"
            className="bg-background/40 border-gold/20"
          />
          <Button type="submit" disabled={loading} className="bg-gradient-gold text-primary-foreground">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PackageSearch className="h-4 w-4 mr-2" />}
            {loading ? "" : "Track"}
          </Button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-destructive text-center" role="alert">
            {error}
          </p>
        )}

        {loading && !result && <div className="mt-6 h-64 rounded-2xl bg-secondary animate-pulse" />}

        {o && (
          <div className="mt-6 space-y-5">
            <section className="lux-card rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Order</p>
                  <h2 className="font-display text-xl break-all">{o.order_number}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placed on{" "}
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                    {o.customer_name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl">{inr(Number(o.total || 0))}</div>
                  <div className="text-xs text-muted-foreground mt-1">Payment: {paymentLabel(o.payment_status)}</div>
                  <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full border border-gold text-gold">
                    {statusLabel(o.status)}
                  </span>
                </div>
              </div>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <section className="lux-card rounded-2xl p-5">
                <h3 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Delivery Progress</h3>
                <TrackingTimeline status={o.status} cancellationReason={o.cancellation_reason} timestamps={timestamps} />
              </section>

              <section className="lux-card rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold mb-2">Shipping</h3>
                  <p className="text-sm text-muted-foreground">{o.address}</p>
                  <dl className="mt-3 space-y-1 text-sm">
                    {o.courier_name && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Courier</dt>
                        <dd>{o.courier_name}</dd>
                      </div>
                    )}
                    {o.tracking_number && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Tracking no.</dt>
                        <dd className="break-all">{o.tracking_number}</dd>
                      </div>
                    )}
                    {o.estimated_delivery_date && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Expected by</dt>
                        <dd>
                          {new Date(o.estimated_delivery_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {o.shipping_note && <p className="text-xs text-muted-foreground mt-2">{o.shipping_note}</p>}
                  {!o.courier_name && !o.tracking_number && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                      <Truck className="h-3.5 w-3.5 text-gold" /> Tracking details appear here once your parcel is dispatched.
                    </p>
                  )}
                  {o.tracking_url && (
                    <Button asChild variant="outline" className="mt-4 w-full border-gold/40 text-gold">
                      <a href={o.tracking_url} target="_blank" rel="noopener noreferrer nofollow">
                        Track Shipment <ExternalLink className="h-3.5 w-3.5 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>

                <div className="pt-4 border-t border-border text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(Number(o.subtotal || 0))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{inr(Number(o.shipping || 0))}</span></div>
                  {Number(o.discount) > 0 && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{inr(Number(o.discount))}</span></div>
                  )}
                  <div className="flex justify-between font-semibold pt-1"><span>Total</span><span className="text-gold">{inr(Number(o.total || 0))}</span></div>
                </div>
              </section>
            </div>

            <section className="lux-card rounded-2xl p-5">
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Items</h3>
              {result!.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No item details recorded for this order.</p>
              ) : (
                <ul className="space-y-3">
                  {result!.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <img
                        src={resolveImages({ image_url: it.product_image } as any)[0]}
                        alt={it.product_name}
                        loading="lazy"
                        className="h-14 w-14 rounded-lg object-cover border border-gold/20"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{it.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty {it.quantity} · {inr(Number(it.price || 0))}</p>
                      </div>
                      <span className="text-sm whitespace-nowrap">{inr(Number(it.price || 0) * Number(it.quantity || 1))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TrackOrder;
