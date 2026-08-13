import { motion } from "framer-motion";
import { Star, Quote, ShieldCheck } from "lucide-react";

const REVIEWS = [
  {
    name: "Mehul Patel",
    city: "Ahmedabad",
    product: "7 Mukhi Rudraksha",
    text: "Product original aur properly energised mila. Packing premium thi aur consultation ke baad hi recommend kiya gaya.",
  },
  {
    name: "Priya Shah",
    city: "Surat",
    product: "Yellow Sapphire",
    text: "Certificate ke sath stone mila. Ring pehenne ke baad confidence aur clarity me visible improvement feel hua.",
  },
  {
    name: "Harsh Mehta",
    city: "Vadodara",
    product: "Sri Yantra",
    text: "Office desk ke liye Sri Yantra liya. Quality excellent hai aur guidance bhi clear di gayi.",
  },
  {
    name: "Nisha Trivedi",
    city: "Rajkot",
    product: "Crystal Bracelet",
    text: "Bracelet comfortable hai, finish luxury lagti hai. WhatsApp par order process very smooth tha.",
  },
  {
    name: "Karan Joshi",
    city: "Mumbai",
    product: "Vastu Pyramid Set",
    text: "Home vastu correction ke liye product liya. Instructions simple the aur delivery fast ho gayi.",
  },
  {
    name: "Aarohi Desai",
    city: "Pune",
    product: "Meditation Kit",
    text: "Complete kit beautifully curated hai. Dhoop, crystals aur mala sab premium quality ke lage.",
  },
];

const ReviewCard = ({ review }: { review: (typeof REVIEWS)[number] }) => (
  <div className="w-[300px] sm:w-[360px] shrink-0 glass-gold rounded-2xl p-5 shadow-luxury">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <div className="font-display text-lg font-semibold text-cosmic-silver">{review.name}</div>
        <div className="text-xs text-cosmic-silver/55">{review.city} · Verified Buyer</div>
      </div>
      <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground">
        <Quote className="h-4 w-4" />
      </div>
    </div>

    <div className="flex items-center gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
      ))}
      <span className="ml-2 text-[11px] uppercase tracking-widest text-gold/75">{review.product}</span>
    </div>

    <p className="text-sm leading-relaxed text-cosmic-silver/75">“{review.text}”</p>
  </div>
);

const ProductReviews = () => {
  const loop = [...REVIEWS, ...REVIEWS];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="container mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-4">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.24em] text-gold">Product Reviews</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-gradient-gold">Trusted by spiritual buyers</h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-cosmic-silver/70 leading-relaxed">
            Authentic products, verified quality and direct WhatsApp support for every sacred purchase.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-5 w-max px-5"
          animate={{ x: [0, -((360 + 20) * REVIEWS.length)] }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        >
          {loop.map((review, index) => (
            <ReviewCard key={`${review.name}-${index}`} review={review} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductReviews;