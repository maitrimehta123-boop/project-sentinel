import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OrderCard, { type OrderRow } from "@/components/shop/OrderCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/** Look up a single order by its order number. RLS keeps results scoped to the customer. */
const TrackOrder = () => {
  const { user } = useAuth();
  const [ref, setRef] = useState("");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [busy, setBusy] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = ref.trim();
    if (!value) return toast.error("Please enter your Order ID");
    setBusy(true);
    setOrder(null);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
    const query = supabase.from("orders").select("*").eq("user_id", user!.id).limit(1);
    const { data } = isUuid ? await query.eq("id", value) : await query.eq("order_number", value);
    setBusy(false);
    const row = (data as unknown as OrderRow[])?.[0];
    if (!row) return toast.error("No order found with this ID on your account.");
    setOrder(row);
  };

  return (
    <PageLayout title="Track Order" subtitle="Enter your Order ID to see the latest delivery status.">
      <SEO title="Track Order — Astro With Hrishi" description="Track the status of your Astro With Hrishi order." path="/track-order" noindex />
      <div className="container max-w-3xl">
        <form onSubmit={search} className="lux-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-3">
          <Input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Order ID (e.g. AWH-000123)"
            className="h-12 rounded-full bg-secondary border-border"
          />
          <Button disabled={busy} type="submit" className="h-12 rounded-full px-8 bg-gradient-gold text-primary-foreground">
            {busy ? "Searching…" : "Track"}
          </Button>
        </form>

        {order && (
          <div className="mt-8">
            <OrderCard order={order} />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TrackOrder;
