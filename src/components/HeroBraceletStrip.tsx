import { Link } from "react-router-dom";

/**
 * Continuously auto-scrolling strip of bracelet photos shown inside the hero
 * brand-logo panel. Purely presentational — the list is duplicated once so the
 * marquee loops seamlessly.
 */
const BRACELETS = [
  { id: "tiger-eye-bracelet", name: "Tiger Eye Bracelet", img: "/assets/products/1000212779.jpg" },
  { id: "rose-quartz-bracelet", name: "Rose Quartz Bracelet", img: "/assets/products/1000212766.jpg" },
  { id: "pyrite-bracelet", name: "Pyrite Bracelet", img: "/assets/products/1000212768.jpg" },
  { id: "moonstone-bracelet", name: "Moonstone Bracelet", img: "/assets/products/1000212764.jpg" },
];

const HeroBraceletStrip = () => (
  <div className="max-w-lg mx-auto lux-card rounded-3xl border border-gold/25 p-4 sm:p-5 overflow-hidden">
    <p className="text-[10px] uppercase tracking-[0.28em] text-gold text-center mb-4">
      Energised Bracelets
    </p>
    <div className="relative overflow-hidden">
      <div className="flex w-max gap-4 animate-marquee-x">
        {[...BRACELETS, ...BRACELETS].map((b, i) => (
          <Link
            key={`${b.id}-${i}`}
            to={`/product/${b.id}`}
            aria-hidden={i >= BRACELETS.length}
            tabIndex={i >= BRACELETS.length ? -1 : 0}
            className="shrink-0 w-40 sm:w-52 rounded-2xl overflow-hidden bg-secondary border border-border hover:border-gold/50 transition-colors"
          >
            <img
              src={b.img}
              alt={b.name}
              width={416}
              height={416}
              loading="eager"
              decoding="async"
              className="w-full aspect-square object-cover"
            />
          </Link>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
    </div>
  </div>
);

export default HeroBraceletStrip;
