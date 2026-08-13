import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag } from "lucide-react";

const ZODIAC = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

const ShopHero = ({ onShopNow }: { onShopNow: () => void }) => (
  <section className="relative pt-40 pb-16 sm:pb-24 overflow-hidden">
    {/* Floating zodiac glyphs */}
    <div className="absolute inset-0 pointer-events-none">
      {ZODIAC.map((g, i) => (
        <motion.span
          key={i}
          className="absolute text-gold/15 font-display text-4xl sm:text-6xl select-none"
          style={{ left: `${(i * 83) % 95}%`, top: `${(i * 47) % 85}%` }}
          animate={{ y: [0, -22, 0], rotate: [0, 8, 0], opacity: [0.12, 0.32, 0.12] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {g}
        </motion.span>
      ))}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[hsl(var(--cosmic-blue)/0.25)] blur-[100px]" />
      <div className="absolute top-10 left-0 w-[380px] h-[380px] rounded-full bg-[hsl(var(--purple-glow)/0.18)] blur-[110px]" />
    </div>

    {/* Rotating zodiac wheel */}
    <motion.div
      aria-hidden
      className="absolute left-1/2 top-16 -translate-x-1/2 w-[520px] h-[520px] rounded-full border border-gold/25 pointer-events-none"
      animate={{ rotate: 360 }}
      transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-8 rounded-full border border-gold/15" />
      <div className="absolute inset-16 rounded-full border border-gold/10" />
      {ZODIAC.map((g, i) => {
        const angle = (i / 12) * 360;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/60 font-display text-xl"
            style={{ transform: `rotate(${angle}deg) translateY(-250px) rotate(-${angle}deg)` }}
          >
            {g}
          </span>
        );
      })}
    </motion.div>

    <div className="container relative z-10 text-center max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-6"
      >
        <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
        <span className="text-xs tracking-[0.28em] uppercase text-gold">Astro Spiritual Store</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="font-display text-5xl sm:text-7xl font-bold leading-tight mb-6"
      >
        <span className="text-gradient-gold">Sacred Store</span>
        <br />
        <span className="font-serif italic text-3xl sm:text-5xl text-cosmic-silver/85 font-normal">
          for cosmic seekers
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-base sm:text-lg text-cosmic-silver/80 leading-relaxed mb-10 max-w-2xl mx-auto"
      >
        Discover authentic spiritual products handpicked for astrology, healing and positive energy —
        gemstones, rudraksha, yantras, crystals and more.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onShopNow}
          size="lg"
          className="bg-gradient-gold text-primary-foreground font-semibold glow-gold px-8 h-12"
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Shop Now
        </Button>
      </motion.div>
    </div>
  </section>
);

export default ShopHero;
