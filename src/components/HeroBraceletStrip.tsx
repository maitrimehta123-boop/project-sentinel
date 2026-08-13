import { Link } from "react-router-dom";

/**
 * Continuously auto-scrolling strip of bracelet photos shown inside the hero
 * brand-logo panel. Purely presentational — the list is duplicated once so the
 * marquee loops seamlessly.
 */
const BRACELETS = [
  { id: "trishield-bracelet", name: "Trishield Bracelet", img: "/assets/products/trishield-1.jpg" },
  { id: "tiger-eye-bracelet", name: "Tiger Eye Bracelet", img: "/assets/products/1000212779.jpg" },
  { id: "rose-quartz-bracelet", name: "Rose Quartz Bracelet", img: "/assets/products/1000212766.jpg" },
  { id: "pyrite-bracelet", name: "Pyrite Bracelet", img: "/assets/products/1000212768.jpg" },
  { id: "moonstone-bracelet", name: "Moonstone Bracelet", img: "/assets/products/1000212764.jpg" },
];

const HeroBraceletStrip = () => (
  <div className="mt-2 max-w-lg mx-auto lux-card rounded-2xl border border-gold/25 p-3 overflow-hidden">
    <p className="text-[10px] uppercase tracking-[0.28em] text-gold text-center mb-3">
      Energised Bracelets
    </p>
    <div className="relative overflow-hidden">
      <div className="flex w-max gap-3 animate-marquee-x">
        {[...BRACELETS, ...BRACELETS].map((b, i) => (
          <Link
            key={`${b.id}-${i}`}
            to={`/product/${b.id}`}
            aria-hidden={i >= BRACELETS.length}
            tabIndex={i >= BRACELETS.length ? -1 : 0}
            className="shrink-0 w-24 sm:w-28 rounded-xl overflow-hidden bg-secondary border border-border hover:border-gold/50 transition-colors"
          >
            <img
              src={b.img}
              alt={b.name}
              width={224}
              height={224}
              loading="lazy"
              decoding="async"
              className="w-full aspect-square object-cover"
            />
          </Link>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>
  </div>
);

export default HeroBraceletStrip;
