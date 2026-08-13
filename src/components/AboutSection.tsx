import { motion } from "framer-motion";
import { Award, BookOpen, Users, Star } from "lucide-react";

const astrologerImg = "/assets/about/1000194428_(2).jpg";

const achievements = [
  { icon: Award, label: "Certified Vedic Astrologer", value: "Jyotish Acharya" },
  { icon: BookOpen, label: "Scriptures Mastered", value: "20+ Texts" },
  { icon: Users, label: "Lives Transformed", value: "10,000+" },
  { icon: Star, label: "Satisfaction Rate", value: "98%" },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] max-w-md mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-br from-gold/30 via-cosmic-purple/30 to-cosmic-blue/30 rounded-3xl blur-2xl" />
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-gold via-cosmic-purple to-cosmic-blue opacity-60" />
              <div className="relative w-full h-full rounded-3xl shadow-luxury overflow-hidden bg-gradient-to-br from-cosmic-purple/30 via-background to-cosmic-blue/30">
                <img
                  src={astrologerImg}
                  alt="Astrologer Hrishi"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />

              </div>
              {/* Decorative wheel */}
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full glass-gold flex items-center justify-center animate-float">
                <div className="text-center">
                  <div className="font-display text-2xl text-gradient-gold font-bold">3+</div>
                  <div className="text-[10px] uppercase tracking-widest text-cosmic-silver/80">
                    Years
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full glass-gold mb-5">
              <span className="text-xs tracking-[0.25em] uppercase text-gold">
                About the Astrologer
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Guiding Souls Through the{" "}
              <span className="text-gradient-gold">Wisdom of the Stars</span>
            </h2>
            <div className="gold-divider w-24 mb-6" />
            <p className="text-cosmic-silver/85 leading-relaxed mb-5">
              For over a decade and a half, <strong className="text-gold">Astrologer Hrishi</strong>{" "}
              has illuminated thousands of lives with the timeless science of Vedic astrology.
              Trained in classical Jyotish texts and modern predictive techniques, his readings
              bring rare clarity to life's most profound questions.
            </p>
            <p className="text-cosmic-silver/75 leading-relaxed mb-8">
              From marriage compatibility to business decisions, career direction to spiritual
              awakening — every consultation is rooted in authentic Vedic principles, delivered
              with warmth, depth, and uncompromising integrity.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {achievements.map((a, i) => (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-xl p-4 hover:border-gold/40 transition-colors"
                >
                  <a.icon className="h-5 w-5 text-gold mb-2" />
                  <div className="font-display text-lg font-semibold text-foreground">
                    {a.value}
                  </div>
                  <div className="text-xs text-cosmic-silver/60">{a.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
