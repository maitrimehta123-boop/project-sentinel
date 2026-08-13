import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
const logo = "/assets/brand-logo-light.png";
import { WHATSAPP_NUMBER, PHONE_NUMBER, EMAIL, ADDRESS } from "@/lib/whatsapp";

const Instagram = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);
const Facebook = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const Youtube = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
);

const QUICK = [
  { l: "Home", to: "/" },
  { l: "Shop", to: "/shop" },
  { l: "About", to: "/about" },
  { l: "Contact", to: "/contact" },
];

const HELP = [
  { l: "My Account", to: "/auth" },
  { l: "Cart", to: "/cart" },
  { l: "Privacy Policy", to: "/privacy" },
  { l: "Terms & Conditions", to: "/terms" },
];

const CosmicFooter = () => (
  <footer className="bg-[hsl(0_0%_7%)] text-white/70 pt-16 pb-8">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <img src={logo} alt="Astro With Hrishi" className="h-14 w-auto object-contain" />
            <span className="font-display text-base tracking-[0.18em] text-gold">ASTRO WITH HRISHI</span>
          </div>
          <p className="text-sm leading-relaxed text-white/60 mb-6">
            Authentic, energised astrology products — crystals, bracelets and Vedic remedies, curated and blessed with care.
          </p>
          <div className="flex gap-3">
            {[
              { Icon: Instagram, href: "https://www.instagram.com/astrowithhrishi_555?utm_source=qr" },
              { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61590786894170" },
              { Icon: Youtube, href: "https://www.youtube.com/@AstrowithHrishi" },
              { Icon: MessageCircle, href: `https://wa.me/${WHATSAPP_NUMBER}` },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Social profile"
                className="h-10 w-10 rounded-full border border-white/15 flex items-center justify-center text-gold hover:border-gold hover:bg-gold hover:text-[hsl(0_0%_7%)] transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.2em] text-gold mb-5">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {QUICK.map((x) => (
              <li key={x.to}><Link to={x.to} className="hover:text-gold transition-colors">{x.l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.2em] text-gold mb-5">Help</h4>
          <ul className="space-y-2.5 text-sm">
            {HELP.map((x) => (
              <li key={x.to}><Link to={x.to} className="hover:text-gold transition-colors">{x.l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.2em] text-gold mb-5">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold flex-shrink-0" /><a href={`tel:${PHONE_NUMBER}`} className="hover:text-gold">{PHONE_NUMBER}</a></li>
            <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-gold flex-shrink-0" /><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold">WhatsApp Enquiry</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold flex-shrink-0" /><a href={`mailto:${EMAIL}`} className="hover:text-gold break-all">{EMAIL}</a></li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" /><span>{ADDRESS}</span></li>
          </ul>
        </div>
      </div>

      <div className="h-px bg-white/10 mb-6" />
      <div className="flex flex-col items-center gap-1.5 text-xs text-white/50 text-center">
        <div>© 2026 Astro With Hrishi. All rights reserved.</div>
        <div>
          <span>Design and Developed by </span>
          <span className="text-gold font-semibold tracking-wide">SMD Nexa Solution · Maitri Patel</span>
        </div>
      </div>
    </div>
  </footer>
);

export default CosmicFooter;
