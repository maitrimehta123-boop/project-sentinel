import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BadgeCheck, Gem, HeartHandshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
const astrologerAsset = { url: "/assets/about/astrologer-portrait.jpg" };

const VALUES = [
  { Icon: Gem, title: "Natural Stones Only", text: "Every crystal is sourced natural and checked before it reaches you." },
  { Icon: Sparkles, title: "Energised Before Dispatch", text: "Products are purified and energised with traditional mantras." },
  { Icon: HeartHandshake, title: "Guidance First", text: "We recommend a product only when it truly suits your chart." },
  { Icon: BadgeCheck, title: "4000+ Happy Clients", text: "Trusted by families across India for authentic remedies." },
];

const About = () => (
  <PageLayout title="About Us" subtitle="Premium astrology products, curated and energised with care by Astrologer Hrishi.">
    <SEO
      title="About — Astro With Hrishi | Authentic Astrology Products"
      description="Learn about Astro With Hrishi — authentic, energised crystals, chakra bracelets and Vedic remedies, guided by an experienced astrologer."
      path="/about"
    />
    <div className="container max-w-5xl">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}>
          <div className="aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border border-border shadow-luxury bg-secondary">
            <img src={astrologerAsset.url} alt="Astrologer Hrishi" className="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            <span className="text-foreground font-medium">Astro With Hrishi</span> began with one simple belief — a remedy
            works only when the product is authentic and the guidance behind it is honest.
          </p>
          <p>
            Our collection brings together natural crystals, chakra bracelets and traditional Vedic remedy items such as
            the 7 Chakra Tree and Ranga Dhatu Sarp Set. Each item is hand-checked, purified and energised before it is
            packed.
          </p>
          <p>
            We never push a product. Share your details with us on WhatsApp and you will receive a clear, personal
            recommendation — even if that means buying nothing at all.
          </p>
          <Button asChild size="lg" className="rounded-full px-8 bg-gradient-gold text-primary-foreground mt-2">
            <Link to="/shop">Explore the Collection</Link>
          </Button>
        </motion.div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
        {VALUES.map(({ Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="lux-card rounded-2xl p-7"
          >
            <Icon className="h-8 w-8 text-gold mb-4" />
            <h3 className="font-display text-lg mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </PageLayout>
);

export default About;
