import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, MessageCircle, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO, { SITE_URL } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lineKey, useCart } from "@/lib/cart";
import { resolveImages } from "@/lib/productImages";
import { inr, mrpOf, deliveryEstimate, type DBProduct } from "@/lib/shop";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { catalogById } from "@/lib/catalog";

const REVIEWS = [
  { name: "Priya Shah", city: "Surat", rating: 5, text: "Genuine product with premium packaging. Felt calmer within a few days of wearing it." },
  { name: "Mehul Patel", city: "Ahmedabad", rating: 5, text: "Hrishi ji guided me properly before buying. Delivery was quick and the quality is excellent." },
  { name: "Harsh Mehta", city: "Vadodara", rating: 4, text: "Beautiful finish and clearly energised. Highly recommended for anyone starting out." },
];

const Product = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const add = useCart((s) => s.add);
  const requireAuth = useRequireAuth();
  const [product, setProduct] = useState<DBProduct | null>(() => catalogById(id));
  const [loading, setLoading] = useState(() => !catalogById(id));
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      const fallback = catalogById(id);
      if (!fallback) setLoading(true);
      // Catalog ids are slugs, not UUIDs — skip the query for those.
      const { data } = fallback
        ? { data: null }
        : await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (!alive) return;
      setProduct((data as unknown as DBProduct) ?? fallback);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const images = useMemo(() => (product ? resolveImages(product) : []), [product]);

  if (loading) {
    return (
      <PageLayout>
        <div className="container grid lg:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl bg-secondary animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-secondary animate-pulse rounded" />
            <div className="h-4 w-full bg-secondary animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-secondary animate-pulse rounded" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout title="Product not found">
        <div className="container text-center">
          <Button asChild className="rounded-full bg-gradient-gold text-primary-foreground">
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const price = Number(product.price);
  const mrp = mrpOf(price, product.discount_percent);
  const out = product.stock <= 0;

  const line = {
    id: lineKey(product.id),
    product_id: product.id,
    name: product.name,
    price,
    image_url: product.image_url,
    variant: null,
  };

  const addToCart = () => {
    if (!requireAuth()) return;
    add(line, qty);
    toast.success(`${product.name} added to cart`);
  };

  const buyNow = () => {
    if (!requireAuth()) return;
    add(line, qty);
    nav("/checkout");
  };

  return (
    <PageLayout>
      <SEO
        title={`${product.name} — Buy Energised ${product.category ?? "Astrology Product"} | Astro With Hrishi`}
        description={(product.description ?? `Buy the ${product.name}, energised and blessed by Astrologer Hrishi.`).slice(0, 155)}
        path={`/product/${product.id}`}
        type="product"
        image={images[0]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description ?? undefined,
          image: images.map((src) => (src.startsWith("http") ? src : `${SITE_URL}${src}`)),
          sku: product.id,
          brand: { "@type": "Brand", name: "Astro With Hrishi" },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating || 4.8).toFixed(1),
            reviewCount: product.review_count || 36,
          },
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/product/${product.id}`,
            price: String(price),
            priceCurrency: "INR",
            availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          },
        }}
      />

      <div className="container">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
              <img
                src={images[active]}
                alt={`${product.name} — ${product.category ?? "astrology product"} by Astro With Hrishi`}
                width={800}
                height={800}
                fetchPriority="high"
                decoding="sync"
                className="w-full h-full object-cover"
              />

            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={cn(
                      "h-20 w-20 rounded-xl overflow-hidden border transition-colors",
                      i === active ? "border-gold" : "border-border hover:border-gold/50"
                    )}
                  >
                    <img src={src} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            {product.category && <p className="text-[11px] uppercase tracking-[0.28em] text-gold mb-3">{product.category}</p>}
            <h1 className="font-display text-3xl sm:text-4xl mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1 text-gold">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-gold" />)}
              </span>
              <span className="text-foreground font-medium">{Number(product.rating || 4.8).toFixed(1)}</span>
              <span>· {product.review_count || 36} reviews</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl">{inr(price)}</span>
              <span className="text-muted-foreground line-through">{inr(mrp)}</span>
              {Number(product.discount_percent) > 0 && (
                <span className="text-sm font-semibold text-gold">{Math.round(Number(product.discount_percent))}% off</span>
              )}
              <span className="text-xs uppercase tracking-wider text-gold">Inclusive of all taxes</span>
            </div>

            <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-8">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-full">
                <button onClick={() => setQty((n) => Math.max(1, n - 1))} className="h-11 w-11 text-lg hover:text-gold" aria-label="Decrease quantity">−</button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button onClick={() => setQty((n) => n + 1)} className="h-11 w-11 text-lg hover:text-gold" aria-label="Increase quantity">+</button>
              </div>
              <span className={cn("text-sm inline-flex items-center gap-1.5", out ? "text-destructive" : "text-gold")}>
                <Check className="h-4 w-4" /> {out ? "Out of stock" : "In stock — ships in 24 hrs"}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <Button onClick={addToCart} disabled={out} variant="outline" size="lg" className="rounded-full px-8 btn-outline-gold min-h-11">
                <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button onClick={buyNow} disabled={out} size="lg" className="rounded-full px-8 bg-gradient-gold text-primary-foreground min-h-11">
                Buy Now
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full btn-whatsapp-ghost min-h-11">
                <a href={waLink(`Hello, I want to know more about "${product.name}" (${inr(price)}).`)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> Ask on WhatsApp
                </a>
              </Button>
            </div>


            <div className="grid sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="lux-card rounded-xl p-4"><Truck className="h-5 w-5 text-gold mb-2" />Delivery by {deliveryEstimate()}</div>
              <div className="lux-card rounded-xl p-4"><ShieldCheck className="h-5 w-5 text-gold mb-2" />100% authentic & energised</div>
              <div className="lux-card rounded-xl p-4"><MessageCircle className="h-5 w-5 text-gold mb-2" />Free astrologer guidance</div>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <section className="mt-20">
          <h2 className="font-display text-2xl sm:text-3xl mb-2">Customer Reviews</h2>
          <div className="gold-divider w-24 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="lux-card rounded-2xl p-6">
                <div className="flex gap-1 text-gold mb-3">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-gold" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{r.text}"</p>
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.city}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Product;
