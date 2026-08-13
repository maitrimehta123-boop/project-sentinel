import { ReactNode } from "react";
import StarField from "@/components/StarField";
import CosmicNavbar from "@/components/CosmicNavbar";
import CosmicFooter from "@/components/CosmicFooter";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const PageLayout = ({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) => (
  <div className="relative min-h-screen overflow-x-hidden flex flex-col">
    <StarField />
    <CosmicNavbar />
    {title && (
      <section className="pt-36 pb-8 text-center container">
        <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-3">{title}</h1>
        {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
        <div className="gold-divider w-28 mx-auto mt-6" />
      </section>
    )}
    <main className={`flex-1 pb-20 ${title ? "" : "pt-28"}`}>{children}</main>
    <CosmicFooter />
    <FloatingWhatsApp />
  </div>
);

export default PageLayout;
