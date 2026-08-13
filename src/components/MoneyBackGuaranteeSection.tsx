import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, ArrowRight, CircleCheck as CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MoneyBackGuaranteeSection = () => {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cosmic-purple/10 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative glass-gold rounded-3xl p-8 sm:p-12 overflow-hidden">
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gold/30 via-cosmic-purple/20 to-gold/30 opacity-50 animate-pulse" />

            <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", damping: 15 }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/30 blur-2xl rounded-full" />
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-gold flex items-center justify-center glow-gold">
                    <ShieldCheck className="h-14 w-14 sm:h-16 sm:w-16 text-primary-foreground" />
                  </div>
                  {/* Floating sparkles */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-gold" />
                    <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-gold/70" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-4"
                >
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span className="text-sm uppercase tracking-widest text-gold font-semibold">
                    Our Promise
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-3xl sm:text-4xl font-bold mb-4"
                >
                  <span className="text-gradient-gold">100% Money Back</span> Guarantee
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-cosmic-silver/80 leading-relaxed mb-6"
                >
                  We stand behind the transformative power of our consultations with absolute confidence.
                  If you're not completely satisfied with your guidance within <strong className="text-gold">6 months</strong>,
                  we offer a full refund — no questions asked.
                </motion.p>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-4 justify-center lg:justify-start mb-6"
                >
                  {["Zero Risk", "Full Refund", "6 Months Validity"].map((text) => (
                    <div key={text} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-gold" />
                      <span className="text-cosmic-silver/90">{text}</span>
                    </div>
                  ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                >
                  <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground glow-gold hover:scale-[1.02] transition-transform">
                    <Link to="/booking">
                      Book Your Session <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-gold/30 text-gold hover:bg-gold/10">
                    <Link to="/terms">View Terms & Conditions</Link>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Disclaimer */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="relative text-center text-xs text-cosmic-silver/50 mt-8 pt-6 border-t border-gold/10"
            >
              * Terms & Conditions apply. Guarantee valid for first-time consultations only.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MoneyBackGuaranteeSection;
