import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleImageError } from "@/lib/productImages";

/**
 * Single-image auto-advancing showcase of bracelet photos shown inside the
 * hero brand-logo panel. One bracelet fills the box at a time and the strip
 * automatically cross-fades to the next photo, looping continuously.
 */
const BRACELETS = [
  { id: "tiger-eye-bracelet", name: "Tiger Eye Bracelet", img: "/assets/products/1000212779.jpg" },
  { id: "rose-quartz-bracelet", name: "Rose Quartz Bracelet", img: "/assets/products/1000212766.jpg" },
  { id: "pyrite-bracelet", name: "Pyrite Bracelet", img: "/assets/products/1000212768.jpg" },
  { id: "moonstone-bracelet", name: "Moonstone Bracelet", img: "/assets/products/1000212764.jpg" },
];

const AUTO_ADVANCE_MS = 2600;

const HeroBraceletStrip = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % BRACELETS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-lg mx-auto lux-card rounded-3xl border border-gold/25 p-4 sm:p-5">
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold text-center mb-4">
        Energised Bracelets
      </p>

      <div className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-secondary border border-border">
        {BRACELETS.map((b, i) => (
          <Link
            key={b.id}
            to={`/product/${b.id}`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          >
            <img
              src={b.img}
              alt={b.name}
              width={416}
              height={416}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent text-white text-xs sm:text-sm text-center py-2.5 px-3">
              {b.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Progress dots — also let people jump to a bracelet manually. */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {BRACELETS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Show ${b.name}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-gold" : "w-1.5 bg-gold/30 hover:bg-gold/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBraceletStrip;
