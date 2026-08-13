import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const logo = "/assets/brand-logo.png";

/** Minimal white logo intro shown once per session. */
const SplashLoader = ({ onLoadComplete }: { onLoadComplete?: () => void }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onLoadComplete?.();
    }, 1900);
    return () => clearTimeout(t);
  }, [onLoadComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Logo sits inside a circular gold ring that traces itself, then the mark settles. */}
          <div className="relative h-36 w-36 sm:h-44 sm:w-44 flex items-center justify-center">
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-2 border-gold/25"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            <motion.svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full -rotate-90"
            >
              <motion.circle
                cx="50"
                cy="50"
                r="49"
                fill="none"
                stroke="hsl(var(--gold))"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </motion.svg>
            <motion.img
              src={logo}
              alt="Astro With Hrishi"
              className="h-24 sm:h-28 w-auto object-contain"
              initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          <motion.div
            className="font-display text-sm sm:text-base tracking-[0.4em] text-foreground mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            ASTRO WITH HRISHI
          </motion.div>
          <motion.div
            className="h-px bg-gold mt-6"
            initial={{ width: 0 }}
            animate={{ width: 140 }}
            transition={{ delay: 0.5, duration: 1.1, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashLoader;
