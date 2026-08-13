import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBER, PHONE_NUMBER } from "@/lib/whatsapp";

const POPUP_SHOWN_KEY = "awh-popup-shown-v2";
const POPUP_DELAY = 15000; // 15 seconds

const GuaranteePopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if popup was already shown
    if (localStorage.getItem(POPUP_SHOWN_KEY)) return;

    const timer = setTimeout(() => {
      setShow(true);
      localStorage.setItem(POPUP_SHOWN_KEY, "true");
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => setShow(false);

  const handleCTA = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Namaste! I'm interested in learning more about the 100% Money Back Guarantee (6 Months). Please share the details."
      )}`,
      "_blank"
    );
    closePopup();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[160]"
          >
            <div className="relative w-full max-w-md glass-gold rounded-3xl overflow-hidden shadow-2xl">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-cosmic-purple/10" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cosmic-purple/20 rounded-full blur-3xl" />

              {/* Close button */}
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors text-cosmic-silver hover:text-gold"
                aria-label="Close popup"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mb-6 glow-gold"
                >
                  <ShieldCheck className="w-10 h-10 text-primary-foreground" />
                </motion.div>

                {/* Celebration */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                  <span className="text-sm uppercase tracking-widest text-gold font-semibold">
                    Special Offer
                  </span>
                  <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-display text-2xl sm:text-3xl font-bold text-gradient-gold mb-4"
                >
                  6 Month 100% Money Back Guarantee
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-cosmic-silver/80 leading-relaxed mb-6"
                >
                  We stand behind our proven methods with absolute confidence. If you're not completely
                  satisfied within 6 months, we offer a 100% full refund — no questions asked.*
                </motion.p>

                {/* Disclaimer */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-cosmic-silver/50 mb-6"
                >
                  * Terms & Conditions Apply
                </motion.p>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="w-full space-y-3"
                >
                  <Button
                    onClick={handleCTA}
                    size="lg"
                    className="w-full bg-gradient-gold text-primary-foreground font-semibold glow-gold hover:scale-[1.02] transition-transform"
                  >
                    Contact Us Today
                  </Button>
                  <p className="text-xs text-cosmic-silver/60">
                    Call: <a href={`tel:${PHONE_NUMBER}`} className="text-gold hover:underline">{PHONE_NUMBER}</a>
                  </p>
                </motion.div>
              </div>

              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-gold/40 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -100],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GuaranteePopup;
