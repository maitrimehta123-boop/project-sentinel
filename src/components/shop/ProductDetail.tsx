import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingCart, Star, Truck, X, ShieldCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { lineKey, useCart } from "@/lib/cart";
import { resolveImages } from "@/lib/productImages";
import { deliveryEstimate, inr, mrpOf, type DBProduct } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
};

const Stars = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn("flex items-center gap-0.5", className)}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(value) ? "fill-gold text-gold" : "text-gold/25")} />
    ))}
  </div>
);

const ProductDetail = ({
  product,
  related,
  onClose,
  onOpenProduct,
  wished,
  onToggleWishlist,
}: {
  product: DBProduct;
  related: DBProduct[];
  onClose: () => void;
  onOpenProduct: (p: DBProduct) => void;
  wished: boolean;
  onToggleWishlist: () => void;
}) => {
  const { user } = useAuth();
  const add = useCart((s) => s.add);
  const requireAuth = useRequireAuth();
  const images = useMemo(() => resolveImages(product), [product]);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<string | null>(
    product.variants?.[0]?.options?.[0] ?? null
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    setActive(0);
    setQty(1);
    setVariant(product.variants?.[0]?.options?.[0] ?? null);
    supabase
      .from("product_reviews")
      .select("id, author_name, rating, comment, created_at, user_id")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) ?? []));
  }, [product]);

  const mrp = mrpOf(Number(product.price), product.discount_percent);
  const outOfStock = product.stock <= 0;
  const cartLine = {
    id: lineKey(product.id, variant),
    product_id: product.id,
    name: product.name,
    price: Number(product.price),
    image_url: product.image_url,
    variant,
  };

  const addToCart = () => {
    if (!requireAuth()) return;
    if (outOfStock) return toast.error("This item is out of stock");
    add(cartLine, qty);
    toast.success(`${product.name} added to cart`);
  };

  const submitReview = async () => {
    if (!user) return toast.error("Please sign in to review");
    if (comment.trim().length < 3) return toast.error("Please write a short review");
    const { data: p } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    const { error } = await supabase.from("product_reviews").insert({
      product_id: product.id,
      user_id: user.id,
      author_name: p?.full_name || user.email?.split("@")[0] || "Customer",
      rating,
      comment: comment.trim(),
    });
    if (error) return toast.error(error.message);
    setComment("");
    toast.success("Thank you for your review");
    const { data } = await supabase
      .from("product_reviews")
      .select("id, author_name, rating, comment, created_at, user_id")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) ?? []);
  };

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : Number(product.rating);

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-background/85 backdrop-blur-md p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative mx-auto max-w-4xl bg-[hsl(var(--card))] border border-gold/30 rounded-3xl overflow-hidden shadow-2xl my-4"
        initial={{ scale: 0.95, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-background/80 flex items-center justify-center border border-gold/30 hover:border-gold"
        >
          <X className="h-4 w-4 text-cosmic-silver" />
        </button>

        {/* ── Rectangular box: image left, info right, qty+cart bottom-right ── */}
        <div className="flex flex-col sm:flex-row">
          {/* Left: image */}
          <div className="sm:w-1/2 p-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cosmic-purple/25 to-background">
              <img
                src={images[active]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discount_percent > 0 && (
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-destructive/90 text-white">
                  -{product.discount_percent}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={cn(
                      "h-14 w-14 shrink-0 rounded-lg overflow-hidden border",
                      i === active ? "border-gold" : "border-gold/20"
                    )}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: info + quantity + buttons */}
          <div className="sm:w-1/2 p-5 sm:p-6 flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-gold/70">{product.category}</span>
            <h2 className="font-display text-2xl font-bold text-cosmic-silver mt-1 mb-2">{product.name}</h2>

            <div className="flex items-center gap-2 text-xs mb-3">
              <Stars value={avgRating} />
              <span className="text-cosmic-silver/70">
                {avgRating.toFixed(1)} · {reviews.length || product.review_count} reviews
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-3xl font-bold text-gradient-gold">{inr(Number(product.price))}</span>
              <span className="text-sm text-cosmic-silver/50 line-through">{inr(mrp)}</span>
              {product.discount_percent > 0 && (
                <span className="text-xs font-bold text-emerald-400">-{product.discount_percent}%</span>
              )}
            </div>
            <div className={cn("text-xs font-semibold mb-4", outOfStock ? "text-destructive" : "text-emerald-400")}>
              {outOfStock ? "Out of stock" : `In stock · ${product.stock} available`}
            </div>

            <p className="text-sm text-cosmic-silver/70 leading-relaxed mb-4">
              {product.description}
            </p>

            {product.variants?.map((v) => (
              <div key={v.name} className="mb-4">
                <div className="text-xs text-cosmic-silver/70 mb-1.5">{v.name}</div>
                <div className="flex flex-wrap gap-2">
                  {v.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => setVariant(o)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs border transition-colors",
                        variant === o
                          ? "bg-gradient-gold text-primary-foreground border-transparent"
                          : "border-gold/30 text-cosmic-silver/75 hover:border-gold"
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-3 gap-2 text-[11px] text-cosmic-silver/70 mb-4">
              <div className="glass-gold rounded-xl p-2 text-center">
                <Truck className="h-4 w-4 text-gold mx-auto mb-1" />
                By {deliveryEstimate()}
              </div>
              <div className="glass-gold rounded-xl p-2 text-center">
                <ShieldCheck className="h-4 w-4 text-gold mx-auto mb-1" />
                100% Authentic
              </div>
              <div className="glass-gold rounded-xl p-2 text-center">
                <RotateCcw className="h-4 w-4 text-gold mx-auto mb-1" />
                7-Day Support
              </div>
            </div>

            {/* Quantity + Add to cart — bottom of right side */}
            <div className="mt-auto">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-cosmic-silver/70">Quantity</span>
                <div className="flex items-center border border-gold/30 rounded-full">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-8 w-8 flex items-center justify-center text-gold">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="h-8 w-8 flex items-center justify-center text-gold">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onToggleWishlist}
                  className={cn("border-gold/40 hover:bg-gold/10", wished ? "text-destructive border-destructive/40" : "text-gold")}
                  aria-label="Wishlist"
                >
                  <Heart className={cn("h-4 w-4", wished && "fill-destructive")} />
                </Button>
                <Button variant="outline" onClick={addToCart} disabled={outOfStock} className="flex-1 border-gold/40 text-gold hover:bg-gold/10">
                  <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-gold/20 p-5 sm:p-6">
          <h3 className="font-display text-lg text-gradient-gold mb-3">Customer Reviews</h3>
          <div className="glass-gold rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-cosmic-silver/70">Your rating</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} star`}>
                  <Star className={cn("h-4 w-4", n <= rating ? "fill-gold text-gold" : "text-gold/30")} />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Share your experience with this product..."
              className="bg-background/40 border-gold/20 min-h-[70px]"
            />
            <Button onClick={submitReview} size="sm" className="mt-2 bg-gradient-gold text-primary-foreground">
              Post Review
            </Button>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 && (
              <p className="text-sm text-cosmic-silver/60">No reviews yet — be the the first to share your experience.</p>
            )}
            {reviews.map((r) => (
              <div key={r.id} className="glass-gold rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-cosmic-silver">{r.author_name}</span>
                  <span className="text-[11px] text-cosmic-silver/50">{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                </div>
                <Stars value={r.rating} className="my-1" />
                <p className="text-sm text-cosmic-silver/75">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="border-t border-gold/20 p-5 sm:p-6">
            <h3 className="font-display text-lg text-gradient-gold mb-3">You may also like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {related.map((p) => (
                <button key={p.id} onClick={() => onOpenProduct(p)} className="glass-gold rounded-xl overflow-hidden text-left hover:border-gold transition-colors">
                  <img src={resolveImages(p)[0]} alt={p.name} loading="lazy" className="w-full aspect-square object-cover" />
                  <div className="p-2">
                    <div className="text-xs text-cosmic-silver line-clamp-2">{p.name}</div>
                    <div className="text-xs text-gold font-semibold mt-1">{inr(Number(p.price))}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProductDetail;
