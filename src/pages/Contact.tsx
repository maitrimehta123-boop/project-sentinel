import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { openWhatsApp, PHONE_NUMBER, EMAIL, WHATSAPP_NUMBER, ADDRESS } from "@/lib/whatsapp";
import { toast } from "sonner";

const MAP_QUERY = encodeURIComponent(ADDRESS);
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;


const Contact = () => {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert(f);
    setSending(false);
    if (error) return toast.error("Failed to send");
    openWhatsApp(`📨 *Contact Inquiry*\n\nName: ${f.name}\nEmail: ${f.email}\nPhone: ${f.phone}\nSubject: ${f.subject}\n\n${f.message}`);
    toast.success("Message sent!");
    setF({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <PageLayout title="Get in Touch" subtitle="We respond within hours on WhatsApp.">
      <SEO title="Contact — Astro With Hrishi" description="Call, WhatsApp or email Astrologer Hrishi. Based in Vadodara, serving clients worldwide." path="/contact" />
      <div className="container max-w-6xl space-y-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              { Icon: Phone, label: "Call", value: PHONE_NUMBER, href: `tel:${PHONE_NUMBER}` },
              { Icon: MessageCircle, label: "WhatsApp", value: PHONE_NUMBER, href: `https://wa.me/${WHATSAPP_NUMBER}` },
              { Icon: Mail, label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
              { Icon: MapPin, label: "Location", value: ADDRESS, href: MAP_LINK },
            ].map(({ Icon, label, value, href }, i) => (
              <a
                key={i}
                href={href}
                {...(label === "Location" || label === "WhatsApp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="glass-gold rounded-2xl p-5 flex items-start gap-4 hover:glow-gold transition-all"
              >
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-gold flex items-center justify-center"><Icon className="h-5 w-5 text-primary-foreground" /></div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-gold/80">{label}</div>
                  <div className="text-cosmic-silver/90 break-words leading-relaxed">{value}</div>
                </div>
              </a>
            ))}

            <div className="glass-gold rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-gold/80 mb-1">Working Hours</div>
              <div className="text-cosmic-silver/90 text-sm">Mon – Sat · 9:00 AM – 8:00 PM IST</div>
              <div className="text-cosmic-silver/60 text-xs mt-1">Sunday by appointment</div>
            </div>
          </div>
          <form onSubmit={submit} className="glass-gold rounded-3xl p-6 space-y-4">
            <Input required placeholder="Your Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-12 bg-secondary border-border" />
            <Input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="h-12 bg-secondary border-border" />
            <Input type="tel" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="h-12 bg-secondary border-border" />
            <Input placeholder="Subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className="h-12 bg-secondary border-border" />
            <Textarea required placeholder="Your message..." value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="min-h-[120px] bg-secondary border-border" />
            <Button disabled={sending} type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground glow-gold">
              <Send className="h-4 w-4 mr-2" />{sending ? "Sending…" : "Send Message"}
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="glass-gold rounded-2xl p-5 flex items-start gap-4">
            <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-gold flex items-center justify-center"><MapPin className="h-5 w-5 text-primary-foreground" /></div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest text-gold/80 mb-1">Visit Us</div>
              <address className="not-italic text-cosmic-silver/90 leading-relaxed break-words">{ADDRESS}</address>
              <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-gold underline underline-offset-4">
                Open in Google Maps
              </a>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden glass-gold p-1 shadow-luxury">
            <iframe
              title={`Astro With Hrishi — ${ADDRESS}`}
              src={`https://www.google.com/maps?q=${MAP_QUERY}&z=17&output=embed`}
              className="w-full h-[320px] sm:h-[360px] rounded-[1.4rem] border-0"
              width={1200}
              height={360}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

    </PageLayout>
  );
};

export default Contact;
