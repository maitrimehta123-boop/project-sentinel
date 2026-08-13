import { motion } from "framer-motion";
import CountUp from "./CountUp";
import { Award, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

const stats = [
  { end: 4000, suffix: "+", label: "Consultations", Icon: Sparkles },
  { end: 98, suffix: "%", label: "Satisfied Clients", Icon: HeartHandshake },
  { end: 3, suffix: "+", label: "Years Certified Expert", Icon: Award },
  { end: 100, suffix: "%", label: "Confidential", Icon: ShieldCheck },
];

const StatsStrip = () => (
  <section className="relative py-20 sm:py-24">
    <div className="container">
      <div className="glass-gold rounded-3xl p-5 sm:p-8 lg:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shadow-luxury border border-gold/25">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative min-h-[190px] sm:min-h-[220px] rounded-2xl border border-gold/20 bg-background/35 p-6 sm:p-8 text-center overflow-hidden group"
          >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
            <div className="mx-auto mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10 shadow-[0_0_35px_hsl(var(--gold)/0.18)] group-hover:scale-110 transition-transform duration-300">
              <s.Icon className="h-7 w-7 sm:h-8 sm:w-8 text-gold" />
            </div>
            <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gradient-gold leading-none">
              <CountUp end={s.end} suffix={s.suffix} />
            </div>
            <div className="text-sm sm:text-base uppercase tracking-widest text-cosmic-silver/80 mt-5 font-medium leading-relaxed">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsStrip;
