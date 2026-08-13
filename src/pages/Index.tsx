import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Truck, BadgeCheck, Star } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import SplashLoader from "@/components/SplashLoader";
import HeroBraceletStrip from "@/components/HeroBraceletStrip";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { resolveImages } from "@/lib/productImages";
import { inr, mrpOf } from "@/lib/shop";
const logo = "/assets/brand-logo.png";

const FEATURES = [
  { Icon: BadgeCheck, title: "100% Authentic", text: "Natural, lab-checked crystals and genuine Vedic remedy materials." },
  { Icon: Sparkles, title: "Energised & Blessed", text: "Every product is purified and energised before it is dispatched." },
  { Icon: Truck, title: "Pan-India Delivery", text: "Secure, insured packaging delivered across India with tracking." },
  { Icon: ShieldCheck, title: "Astrologer Guided", text: "Free guidance on WhatsApp so you wear the right product." },
];

const Index = () => {
  const { products } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <>
      <SplashLoader />
      <SEO
        title="Astro With Hrishi — Premium Astrology Products & Crystals"
        description="Shop authentic, energised astrology products — 7 Chakra trees, crystal bracelets and Vedic remedies. Astrologer guided, delivered across India."
        path="/"
      />
      <PageLayout>
        {/* Hero */}
        <section className="container pt-6 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold border border-gold/40 rounded-full px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Energised Collection
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mt-6 mb-5">
                Premium Astrology Products
                <span className="block text-gradient-gold">Crafted for Positive Energy</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed mb-8">
                Handpicked crystals, chakra bracelets and traditional Vedic remedies — authentic, energised and
                recommended by Astrologer Hrishi.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground rounded-full px-8 tracking-wide">
                  <Link to="/shop">Shop Collection <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 btn-outline-gold min-h-11">
                  <Link to="/about">Our Story</Link>
                </Button>

              </div>
              <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Star className="h-4 w-4 text-gold fill-gold" /> 4.8 average rating</span>
                <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-gold" /> 4000+ happy clients</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative"
            >
              <HeroBraceletStrip />

            </motion.div>
          </div>
        </section>

        {/* Highlighted New Launch */}
        <section className="container pb-10">
          {(() => {
            const trishield = products.find((p) => p.id === "trishield-bracelet");
            if (!trishield) return null;
            const img = resolveImages(trishield)[0];
            const mrp = mrpOf(Number(trishield.price), trishield.discount_percent);
            return (
              <div className="lux-card rounded-3xl overflow-hidden border-2 border-gold/50 glow-gold relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
                <div className="grid md:grid-cols-2 gap-8 items-center p-6 md:p-10">
                  <Link to="/product/trishield-bracelet" className="relative aspect-square md:aspect-[4/3] overflow-hidden rounded-2xl bg-secondary group">
                    <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold px-4 py-2 rounded-full bg-gradient-gold text-primary-foreground shadow-lg">
                      <Sparkles className="h-3.5 w-3.5" /> New Launch
                    </span>
                    <img
                      src={img}
                      alt="Trishield Bracelet — Rudraksh, Sphatik and Karungali"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="eager"
                      fetchPriority="high"
                      decoding="sync"
                    />
                  </Link>
                  <div className="flex flex-col items-start">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-gold mb-3">Chakra & Protection</p>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4">Trishield Bracelet</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6 max-w-lg">
                      Three powerful gems — Rudraksh, Sphatik and Karungali — brought together to boost confidence,
                      build positivity and attract success. Energised, authentic and designed for everyday wear.
                    </p>
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="font-display text-3xl sm:text-4xl text-gradient-gold">{inr(Number(trishield.price))}</span>
                      <span className="text-muted-foreground line-through text-lg">{inr(mrp)}</span>
                      <span className="text-sm font-semibold text-gold px-3 py-1 rounded-full border border-gold/40">
                        {Math.round(Number(trishield.discount_percent))}% off
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground rounded-full px-8 tracking-wide">
                        <Link to="/product/trishield-bracelet">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="rounded-full px-8 btn-outline-gold min-h-11">
                        <Link to="/shop">View Collection</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Features */}
        <section className="lux-section py-16">
          <div className="container grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ Icon, title, text }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="lux-card rounded-2xl p-7 bg-background"
              >
                <Icon className="h-8 w-8 text-gold mb-4" />
                <h3 className="font-display text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="container py-20">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold mb-2">Bestsellers</p>
              <h2 className="font-display text-3xl sm:text-4xl">Featured Products</h2>
            </div>
            <Link to="/shop" className="text-sm text-foreground hover:text-gold inline-flex items-center gap-1.5">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => {
              const img = resolveImages(p)[0];
              const mrp = mrpOf(Number(p.price), p.discount_percent);
              return (
                <Link key={p.id} to={`/product/${p.id}`} className="lux-card rounded-2xl overflow-hidden group block">
                  <div className="aspect-square overflow-hidden bg-secondary">
                    <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base mb-2 line-clamp-1">{p.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">{inr(Number(p.price))}</span>
                      <span className="text-xs text-muted-foreground line-through">{inr(mrp)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-[hsl(0_0%_7%)] py-16">
          <div className="container text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">Not sure which product suits you?</h2>
            <p className="text-white/60 max-w-xl mx-auto mb-8">
              Share your birth details on WhatsApp and get a personal recommendation before you buy.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 bg-gold text-[hsl(0_0%_7%)] hover:opacity-90">
              <Link to="/contact">Get Guidance</Link>
            </Button>
          </div>
        </section>
      </PageLayout>
    </>
  );
};

export default Index;
