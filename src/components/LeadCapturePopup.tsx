import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, User, Phone, Mail, MapPin, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const POPUP_SHOWN_KEY = "awh-lead-capture-shown";
const POPUP_DELAY = 30000; // 30 seconds
const OPEN_EVENT = "awh-open-signin-popup";

const services = [
  "Astrology", "Kundli Matching", "Numerology", "Mobile Number Numerology", "Name Numerology",
  "Business Name Selection", "Brand Name Numerology", "Logo Guidance",
  "Marketing Strategy", "Complete Startup Consultation",
];

const LeadCapturePopup = () => {
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name: "", mobile_number: "", email: "", city: "", interested_service: "",
  });

  useEffect(() => {
    const open = () => {
      setShow(true);
      localStorage.setItem(POPUP_SHOWN_KEY, "true");
    };
    window.addEventListener(OPEN_EVENT, open);

    if (localStorage.getItem(POPUP_SHOWN_KEY)) return;
    const timer = setTimeout(() => {
      setShow(true);
      localStorage.setItem(POPUP_SHOWN_KEY, "true");
    }, POPUP_DELAY);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(OPEN_EVENT, open);
    };
  }, []);

  const closePopup = () => setShow(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.mobile_number) {
      toast.error("Please fill in required fields");
      return;
    }

    setSubmitting(true);
    const { error } = await (supabase as any).from("visitor_leads").insert({
      full_name: form.full_name,
      mobile_number: form.mobile_number,
      email: form.email || null,
      city: form.city || null,
      interested_service: form.interested_service || null,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Could not submit. Please try again.");
      return;
    }

    setSuccess(true);
    const firstName = (form.full_name.trim().split(" ")[0]) || "friend";
    const msg = `Login successful. Welcome ${firstName}!`;
    toast.success(msg);
    try {
      const u = new SpeechSynthesisUtterance(msg);
      u.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
    setTimeout(closePopup, 2500);
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value });
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[160]"
          >
            <div className="relative w-full max-w-md glass-gold rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-cosmic-purple/10" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cosmic-purple/20 rounded-full blur-3xl" />

              <button
                onClick={closePopup}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors text-cosmic-silver hover:text-gold"
                aria-label="Close popup"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative p-6 sm:p-8">
                {success ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mb-4 mx-auto glow-gold">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-gradient-gold mb-2">
                      Login Successful!
                    </h3>
                    <p className="text-cosmic-silver/80 text-sm">
                      Welcome {form.full_name.trim().split(" ")[0]}. We've received your details and our expert will contact you shortly.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mb-3"
                    >
                      <ShieldCheck className="w-5 h-5 text-gold animate-pulse" />
                      <span className="text-xs uppercase tracking-widest text-gold font-semibold">
                        Customer Sign In
                      </span>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="font-display text-2xl font-bold mb-2"
                    >
                      <span className="text-gradient-gold">Sign In for Free Consultation</span>
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-cosmic-silver/70 text-sm mb-6"
                    >
                      Share your details and our astrologer will reach out with personalized insights.
                    </motion.p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
                        <Input
                          required
                          placeholder="Full Name *"
                          value={form.full_name}
                          onChange={update("full_name")}
                          className="pl-10 h-11 bg-background/40 border-gold/20"
                        />
                      </div>

                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
                        <Input
                          required
                          type="tel"
                          placeholder="Mobile Number *"
                          value={form.mobile_number}
                          onChange={update("mobile_number")}
                          className="pl-10 h-11 bg-background/40 border-gold/20"
                        />
                      </div>

                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
                        <Input
                          type="email"
                          placeholder="Email (optional)"
                          value={form.email}
                          onChange={update("email")}
                          className="pl-10 h-11 bg-background/40 border-gold/20"
                        />
                      </div>

                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
                        <Input
                          placeholder="City"
                          value={form.city}
                          onChange={update("city")}
                          className="pl-10 h-11 bg-background/40 border-gold/20"
                        />
                      </div>

                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
                        <Select
                          value={form.interested_service}
                          onValueChange={(v) => setForm({ ...form, interested_service: v })}
                        >
                          <SelectTrigger className="pl-10 h-11 bg-background/40 border-gold/20">
                            <SelectValue placeholder="Interested Service" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-gold text-primary-foreground font-semibold glow-gold hover:scale-[1.02] transition-transform"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {submitting ? "Submitting..." : "Sign In & Get Free Consultation"}
                      </Button>

                      <p className="text-center text-[10px] text-cosmic-silver/50">
                        By submitting, you agree to our{" "}
                        <a href="/privacy" className="text-gold hover:underline">Privacy Policy</a>. We respect your privacy.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const openSignInPopup = () => window.dispatchEvent(new Event("awh-open-signin-popup"));

export default LeadCapturePopup;
