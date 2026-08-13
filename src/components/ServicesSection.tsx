import { motion } from "framer-motion";
import { ScrollText, Hash, Briefcase, Gem, Sparkles, MessageCircle, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "919558565655";

const services = [
  { icon: ScrollText, title: "Astrology", desc: "In-depth birth chart analysis revealing your life's blueprint, planetary influences & cosmic purpose.", benefits: ["Kundli analysis", "Planetary predictions", "Remedial guidance"] },
  { icon: Hash, title: "Numerology", desc: "Unlock the power of numbers in your life through name and birth date analysis.", benefits: ["Life path number", "Name correction", "Lucky numbers"] },
  { icon: Phone, title: "Mobile no. Numerology", desc: "Discover how your mobile number influences your energy and success.", benefits: ["Number analysis", "Lucky mobile number", "Energy alignment"] },
  { icon: Briefcase, title: "Complete Business & Startup Consultancy", desc: "End-to-end guidance for your business and startup journey from ideation to success.", benefits: ["Business planning", "Startup mentorship", "Complete growth strategy"] },
  { icon: Gem, title: "Product Consultancy — Gemstones & Crystals", desc: "Expert guidance on selecting the right gemstones and crystals aligned with your chart.", benefits: ["Gemstone recommendation", "Crystal healing", "Energy alignment"] },
];

const ServicesSection = () => {
  const bookOnWhatsApp = (service: string) => {
    const msg = `Namaste Hrishi ji, I'd like to book a ${service} consultation. Please share availability.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section id="services" className="relative py-24 sm:py-32">
      {/* Aurora glow */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cosmic-purple/10 to-transparent pointer-events-none" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full glass-gold mb-5">
            <span className="text-xs tracking-[0.25em] uppercase text-gold">
              Premium Services
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5">
            Sacred Consultations for{" "}
            <span className="text-gradient-gold">Every Life Path</span>
          </h2>
          <div className="gold-divider w-32 mx-auto mb-6" />
          <p className="text-cosmic-silver/75">
            From birth charts to gemstone guidance — every service is a doorway to clarity,
            crafted with classical precision and personalized devotion.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-gold/40 via-cosmic-purple/30 to-cosmic-blue/30 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />

              <div className="relative glass rounded-2xl p-7 h-full flex flex-col hover:border-gold/40 transition-colors">
                <div className="flex items-start justify-between mb-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gold/20 blur-2xl group-hover:bg-gold/40 transition-all" />
                    <div className="relative h-14 w-14 rounded-xl glass-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                      <s.icon className="h-7 w-7 text-gold" />
                    </div>
                  </div>
                </div>

                <h3 className="font-display text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-sm text-cosmic-silver/70 mb-5 leading-relaxed">{s.desc}</p>

                <ul className="space-y-1.5 mb-6 flex-1">
                  {s.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-cosmic-silver/80">
                      <Sparkles className="h-3 w-3 text-gold flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 bg-gradient-gold text-primary-foreground hover:opacity-90"
                  >
                    <a href="#booking">
                      Book <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gold/30 text-gold hover:bg-gold/10 px-3"
                    onClick={() => bookOnWhatsApp(s.title)}
                    aria-label={`WhatsApp ${s.title}`}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
