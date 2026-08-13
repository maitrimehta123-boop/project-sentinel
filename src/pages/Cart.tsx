import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { resolveImage } from "@/lib/productImages";
import { inr, shippingFor } from "@/lib/shop";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const Cart = () => {
  const nav = useNavigate();
  const { items, setQty, remove, total } = useCart();
  const requireAuth = useRequireAuth();
  const subtotal = total();
  const shipping = shippingFor(subtotal);

  return (
    <PageLayout title="Your Cart" subtitle={items.length ? `${items.length} item${items.length > 1 ? "s" : ""} ready for checkout` : undefined}>
      <SEO title="Cart — Astro With Hrishi" description="Review your selected astrology products before checkout." path="/cart" />
      <div className="container">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 text-gold mx-auto mb-5" />
            <p className="text-muted-foreground mb-8">Your cart is empty.</p>
            <Button asChild size="lg" className="rounded-full px-8 bg-gradient-gold text-primary-foreground">
              <Link to="/shop">Browse Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            <div className="space-y-4">
              {items.map((i) => (
                <div key={i.id} className="lux-card rounded-2xl p-4 flex gap-4 items-center">
                  <img src={resolveImage(i.image_url)} alt={i.name} className="h-24 w-24 rounded-xl object-cover bg-secondary" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg truncate">{i.name}</h3>
                    {i.variant && <p className="text-xs text-muted-foreground">{i.variant}</p>}
                    <p className="text-sm font-semibold mt-1">{inr(i.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-border rounded-full">
                        <button onClick={() => setQty(i.id, i.quantity - 1)} className="h-8 w-8 flex items-center justify-center hover:text-gold" aria-label="Decrease">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm">{i.quantity}</span>
                        <button onClick={() => setQty(i.id, i.quantity + 1)} className="h-8 w-8 flex items-center justify-center hover:text-gold" aria-label="Increase">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button onClick={() => remove(i.id)} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="font-display text-lg whitespace-nowrap">{inr(i.price * i.quantity)}</div>
                </div>
              ))}
            </div>

            <aside className="lux-card rounded-2xl p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-xl mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
                <div className="h-px bg-border my-3" />
                <div className="flex justify-between font-display text-lg"><span>Total</span><span>{inr(subtotal + shipping)}</span></div>
              </div>
              <Button onClick={() => { if (requireAuth()) nav("/checkout"); }} size="lg" className="w-full mt-6 rounded-full bg-gradient-gold text-primary-foreground">
                Proceed to Checkout
              </Button>
              <Link to="/shop" className="block text-center text-xs text-muted-foreground hover:text-gold mt-4">Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Cart;
