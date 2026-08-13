import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The astrology reading was breathtakingly accurate. My career predictions came true exactly as told. Truly a master of the cosmic arts!",
  },
  {
    name: "Rohan Mehta",
    location: "Vadodara",
    rating: 5,
    text: "The business name numerology consultation transformed my startup's trajectory. Revenue increased 3x within months of implementing the suggested changes.",
  },
  {
    name: "Anjali Desai",
    location: "Surat",
    rating: 5,
    text: "Mobile number numerology guidance changed my energy completely. Everything started falling into place after following the recommendations.",
  },
  {
    name: "Vikram Patel",
    location: "Vadodara",
    rating: 5,
    text: "The complete startup consultation gave me clarity I never had before. From business planning to marketing strategy, every aspect was covered.",
  },
  {
    name: "Neha Joshi",
    location: "Delhi",
    rating: 5,
    text: "Name numerology correction brought harmony to my personal and professional life. Highly recommend for anyone seeking positive transformation.",
  },
  {
    name: "Arjun Kapoor",
    location: "Pune",
    rating: 5,
    text: "Brand name numerology helped me choose the perfect name for my company. The energy and response from market has been incredible.",
  },
];

const TestimonialCard = ({ t }: { t: (typeof testimonials)[number] }) => (
  <div className="glass rounded-2xl p-7 relative hover:border-gold/40 transition-all group w-[340px] sm:w-[380px] flex-none">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/20 via-transparent to-cosmic-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <Quote className="absolute top-5 right-5 h-10 w-10 text-gold/15 group-hover:text-gold/30 transition-colors" />
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: t.rating }).map((_, j) => (
        <Star key={j} className="h-4 w-4 fill-gold text-gold" />
      ))}
    </div>
    <p className="text-cosmic-silver/85 leading-relaxed mb-6 font-serif text-lg italic">
      "{t.text}"
    </p>
    <div className="flex items-center gap-3 pt-4 border-t border-gold/10">
      <div className="h-11 w-11 rounded-full bg-gradient-gold flex items-center justify-center font-display font-bold text-primary-foreground shadow-lg">
        {t.name[0]}
      </div>
      <div>
        <div className="font-semibold text-foreground">{t.name}</div>
        <div className="text-xs text-cosmic-silver/60">{t.location}</div>
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cosmic-purple/5 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full glass-gold mb-5">
            <span className="text-xs tracking-[0.25em] uppercase text-gold">
              Voices of Transformation
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5">
            Stories Written in the{" "}
            <span className="text-gradient-gold">Stars</span>
          </h2>
          <div className="gold-divider w-32 mx-auto" />
        </motion.div>
      </div>

      {/* Continuous auto-scrolling marquee */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent" />
        <motion.div
          className="flex gap-6 px-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
