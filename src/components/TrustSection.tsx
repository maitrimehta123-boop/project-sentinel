import { motion } from "framer-motion";
import { ShieldCheck, Award, Lock, Sparkles, HeartHandshake, BadgeCheck } from "lucide-react";

const BADGES = [
  { icon: BadgeCheck, label: "Verified Astrologer", desc: "Authentic Vedic lineage" },
  { icon: HeartHandshake, label: "Client Satisfaction", desc: "Thousands guided" },
  { icon: Lock, label: "Confidential", desc: "100% private consultations" },
  { icon: Sparkles, label: "Personalised", desc: "Tailored to your chart" },
  { icon: ShieldCheck, label: "Secure", desc: "Safe & trusted process" },
  { icon: Award, label: "3+ Years", desc: "Proven experience" },
];

const TrustSection = () => {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-96 bg-gradient-to-r from-transparent via-gold/5 to-transparent pointer-events-none" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Trust & Assurance</div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-gradient-gold mb-4">
            Your Satisfaction Is Our Priority
          </h2>
          <p className="text-cosmic-silver/80 leading-relaxed">
            We are committed to providing personalised astrological guidance, dedicated support,
            and professional consultation tailored to your unique journey.
          </p>
          <div className="gold-divider w-32 mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-14">
          {BADGES.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, scale: 1.04 }}
              className="glass-gold rounded-2xl p-5 text-center group"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-gold flex items-center justify-center mb-3 glow-gold group-hover:scale-110 transition-transform">
                <b.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="font-display text-sm font-semibold text-gold leading-tight">
                {b.label}
              </div>
              <div className="text-[11px] text-cosmic-silver/65 mt-1">{b.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Premium Guarantee Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-gold opacity-30 blur-2xl rounded-3xl" />
          <div className="relative glass-gold rounded-3xl p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-5">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.25em] text-gold">
                6-Month Guidance Assurance
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-gradient-gold mb-4">
              Dedicated Support Beyond Your Consultation
            </h3>
            <p className="text-cosmic-silver/80 max-w-2xl mx-auto leading-relaxed mb-6">
              Every consultation includes continued spiritual guidance and professional support to
              help you walk your cosmic path with clarity and confidence.
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-cosmic-silver/75 max-w-2xl mx-auto text-left">
              {[
                "Personalised consultation required",
                "Professional guidance & continued support",
                "Results may vary based on individual circumstances",
                "Terms & conditions apply",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <BadgeCheck className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
