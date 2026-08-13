import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import OrderCard, { type OrderRow } from "@/components/shop/OrderCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Customer order history. RLS restricts rows to the signed-in customer. */
const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!alive) return;
      setOrders((data as unknown as OrderRow[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  return (
    <PageLayout title="My Orders" subtitle="Track every order placed with Astro With Hrishi.">
      <SEO title="My Orders — Astro With Hrishi" description="View and track your Astro With Hrishi orders." path="/orders" noindex />
      <div className="container max-w-4xl">
        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">You have not placed any orders yet.</p>
            <Button asChild className="rounded-full bg-gradient-gold text-primary-foreground">
              <Link to="/shop">Browse the Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Orders;
