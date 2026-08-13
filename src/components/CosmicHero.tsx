import { motion } from "framer-motion";
import { Sparkles, MessageCircle, ArrowDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroGalaxy from "@/assets/hero-galaxy.jpg";
import zodiacCoin from "@/assets/zodiac-coin.png";

const WHATSAPP_NUMBER = "919558565655";
const PHONE_NUMBER = "+91 9558565655";

/* Constellation dot positions (x%, y%) + connections */
const STARS = [
  { id: 0, x: 5, y: 15 }, { id: 1, x: 12, y: 8 }, { id: 2, x: 20, y: 18 },
  { id: 3, x: 8, y: 30 }, { id: 4, x: 18, y: 35 }, { id: 5, x: 25, y: 28 },
  { id: 6, x: 15, y: 50 }, { id: 7, x: 22, y: 62 }, { id: 8, x: 10, y: 68 },
  { id: 9, x: 30, y: 55 }, { id: 10, x: 35, y: 45 }, { id: 11, x: 3, y: 80 },
  { id: 12, x: 14, y: 85 },
];
const LINES = [
  [0, 1], [1, 2], [2, 5], [5, 4], [4, 3], [3, 0],
  [4, 6], [6, 7], [7, 8], [6, 9], [9, 10], [10, 5],
  [8, 11], [11, 12], [12, 7],
];

const ZODIAC_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function ZodiacCoin() {
  return (
    <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px]">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-gold/25 blur-[60px] animate-pulse-glow" />

      {/* Faint rotating astro rings behind */}
      <div className="absolute inset-[-14%] rounded-full border border-gold/20 animate-spin-slower" />
      <div className="absolute inset-[-6%] rounded-full border border-gold/25 animate-spin-slow" />

      <motion.img
        src={zodiacCoin}
        alt="Golden zodiac wheel with twelve astrology signs"
        width={1024}
        height={1024}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="relative w-full h-full object-contain drop-shadow-[0_0_60px_hsl(43_78%_58%/0.45)]"
      />

    </div>
  );
}


function ConstellationBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {LINES.map(([a, b], i) => (
        <line
          key={i}
          x1={`${STARS[a].x}%`} y1={`${STARS[a].y}%`}
          x2={`${STARS[b].x}%`} y2={`${STARS[b].y}%`}
          stroke="#d4af37"
          strokeWidth="0.8"
          opacity="0.35"
        />
      ))}
      {STARS.map((s) => (
        <circle
          key={s.id}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.id % 3 === 0 ? "3" : "2"}
          fill="#d4af37"
          opacity={s.id % 3 === 0 ? "0.9" : "0.6"}
        />
      ))}
      {/* Extra faint stars scattered */}
      {[
        [40,12],[55,5],[65,20],[72,8],[80,15],[88,30],[92,10],
        [45,72],[58,80],[70,65],[78,78],[85,70],[90,85],
        [35,90],[48,95],[62,92],[75,88],
      ].map(([x, y], i) => (
        <circle key={`bg-${i}`} cx={`${x}%`} cy={`${y}%`} r="1" fill="#e8d8a0" opacity="0.45" />
      ))}
    </svg>
  );
}

const CosmicHero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ paddingTop: "88px" }}
    >
      {/* ── Galaxy photo background ── */}
      <img
        src={heroGalaxy}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1088}
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-80"
      />

      {/* ── Deep space tint over photo ── */}
      <div className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 22% 50%, hsl(245 50% 4% / 0.9), transparent 70%), linear-gradient(90deg, hsl(240 45% 3% / 0.92) 0%, hsl(240 45% 3% / 0.6) 45%, transparent 75%)",
        }}
      />


      {/* Nebula glow core */}
      <div
        className="absolute z-0"
        style={{
          right: "5%",
          top: "10%",
          width: "55%",
          height: "80%",
          background:
            "radial-gradient(ellipse at 55% 45%, hsl(285 75% 45% / 0.35) 0%, hsl(265 60% 30% / 0.25) 30%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Constellation lines (left side) */}
      <div className="absolute inset-0 z-0">
        <ConstellationBg />
      </div>

      {/* Gradient overlay bottom fade */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      {/* ── Zodiac coin (right) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, x: 60 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        className="absolute right-[3%] lg:right-[6%] top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center"
      >
        <ZodiacCoin />
      </motion.div>

      {/* ── Faint zodiac symbols on far right ── */}
      <div
        className="absolute right-0 top-0 h-full w-[30%] z-0 hidden lg:block pointer-events-none"
        aria-hidden="true"
      >
        {[
          { sym: "♑", x: "75%", y: "18%" },
          { sym: "♒", x: "88%", y: "35%" },
          { sym: "♓", x: "78%", y: "55%" },
          { sym: "♈", x: "92%", y: "70%" },
          { sym: "♉", x: "70%", y: "80%" },
          { sym: "♐", x: "85%", y: "88%" },
        ].map(({ sym, x, y }, i) => (
          <span
            key={i}
            className="absolute text-gold/20 text-5xl font-serif select-none"
            style={{ left: x, top: y }}
          >
            {sym}
          </span>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="container relative z-20 py-16">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-[620px]"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-gold mb-7"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold animate-twinkle" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-gold font-medium">
              Astrology · Numerology · Spiritual Guidance
            </span>
          </motion.div>

          {/* Heading */}
          <h1 className="font-display leading-[1.08] mb-7">
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-white/95 tracking-tight">
              Unlock Your
            </span>
            <span
              className="block text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gradient-gold"
              style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.03em" }}
            >
              Cosmic Destiny
            </span>
            <span
              className="block text-3xl sm:text-4xl lg:text-5xl font-normal text-white/80 mt-1"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              with Astro Hrishi
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-[17px] text-white/70 mb-10 max-w-[520px] leading-relaxed">
            Transform your life with Astrology, Numerology, Business Name
            Numerology & Complete Startup Consultation. Professional guidance
            for every cosmic journey.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-14">
            <Button
              size="lg"
              className="font-semibold text-[15px] px-7 py-6 transition-all hover:scale-105 active:scale-100"
              style={{
                background: "linear-gradient(135deg, hsl(43 85% 62%), hsl(38 90% 50%))",
                color: "#1a0f00",
                boxShadow: "0 4px 30px hsl(43 78% 58% / 0.5)",
              }}
              asChild
            >
              <a href="#booking">
                <Sparkles className="mr-2 h-4 w-4" />
                Book Consultation
              </a>
            </Button>

            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-500 text-white font-semibold text-[15px] px-7 py-6 transition-all hover:scale-105 active:scale-100"
              style={{ boxShadow: "0 4px 20px hsl(140 60% 40% / 0.4)" }}
              asChild
            >
              <a href={`tel:${PHONE_NUMBER}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </a>
            </Button>

            <Button
              size="lg"
              className="text-[15px] px-7 py-6 transition-all hover:scale-105 active:scale-100 border hover:bg-white/5"
              style={{
                background: "hsl(240 30% 10% / 0.6)",
                borderColor: "hsl(43 60% 50% / 0.4)",
                color: "hsl(43 78% 70%)",
                backdropFilter: "blur(10px)",
              }}
              onClick={() =>
                window.open(
                  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    "Namaste Hrishi ji, I'd like to know more about your astrology consultations."
                  )}`,
                  "_blank"
                )
              }
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 max-w-[520px]"
          >
            {[
              { num: "4000+", label: "Consultations" },
              { num: "98%", label: "Satisfied Clients" },
              { num: "100%", label: "Confidential" },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center rounded-xl px-3 py-5 sm:py-6"
                style={{
                  background: "hsl(240 30% 8% / 0.55)",
                  border: "1px solid hsl(43 60% 50% / 0.22)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-none text-gradient-gold"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {s.num}
                </div>
                <div className="text-[9px] sm:text-[11px] uppercase tracking-widest text-white/50 mt-2">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 text-gold/50 hover:text-gold transition-colors"
        aria-label="Scroll down"
      >
        <ArrowDown className="h-6 w-6" />
      </motion.a>
    </section>
  );
};

export default CosmicHero;
