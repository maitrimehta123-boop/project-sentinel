import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, Calendar, Clock, Sparkles, Send, MessageSquare, CircleCheck as CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { openWhatsApp, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { toast } from "sonner";

const services = [
  "Astrology", "Kundli Matching", "Numerology", "Mobile Number Numerology", "Name Numerology",
  "Business Name Selection", "Brand Name Numerology", "Logo Guidance",
  "Marketing Strategy", "Business Planning", "Complete Startup Consultation",
];

const generateBookingRef = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "AWH-";
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
};

const BookingSection = () => {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", date: "", time: "", service: "", message: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const update = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = generateBookingRef();
    const { error } = await supabase.from("appointments").insert({
      name: form.name, phone: form.phone, email: form.email || null,
      service: form.service, appointment_date: form.date, appointment_time: form.time,
      message: form.message || null,
    });
    if (error) { toast.error("Could not save. Please try again."); return; }

    const msg = `🙏 *Appointment Request - ${ref}*\n\n👤 *Name:* ${form.name}\n📞 *Phone:* ${form.phone}${form.email ? `\n📧 *Email:* ${form.email}` : ""}\n✨ *Service:* ${form.service}\n📅 *Date:* ${form.date}\n⏰ *Time:* ${form.time}${form.message ? `\n📝 *Message:* ${form.message}` : ""}\n\n_Please confirm the appointment._`;
    openWhatsApp(msg);

    setBookingRef(ref);
    setShowSuccess(true);
    setForm({ name: "", phone: "", email: "", date: "", time: "", service: "", message: "" });
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    setBookingRef("");
  };

  return (
    <>
      <section id="booking" className="relative py-24 sm:py-32">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <div className="inline-block px-4 py-1.5 rounded-full glass-gold mb-5">
              <span className="text-xs tracking-[0.25em] uppercase text-gold">
                Sacred Appointment
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5">
              Begin Your{" "}
              <span className="text-gradient-gold">Cosmic Journey</span>
            </h2>
            <div className="gold-divider w-32 mx-auto mb-6" />
            <p className="text-cosmic-silver/75">
              Fill the form and we'll confirm your sacred slot instantly on WhatsApp.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={submit}
            className="relative max-w-3xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-gold/40 via-cosmic-purple/30 to-cosmic-blue/30 rounded-3xl blur-xl opacity-60" />
            <div className="relative glass-gold rounded-3xl p-6 sm:p-10 shadow-luxury space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field icon={User}>
                  <Input required placeholder="Full Name" value={form.name}
                    onChange={(e) => update("name")(e.target.value)} className="pl-11 h-12 bg-background/40 border-gold/20" />
                </Field>
                <Field icon={Phone}>
                  <Input required type="tel" placeholder="Mobile Number" value={form.phone}
                    onChange={(e) => update("phone")(e.target.value)} className="pl-11 h-12 bg-background/40 border-gold/20" />
                </Field>
                <Field icon={Mail}>
                  <Input type="email" placeholder="Email (optional)" value={form.email}
                    onChange={(e) => update("email")(e.target.value)} className="pl-11 h-12 bg-background/40 border-gold/20" />
                </Field>
                <Field icon={Sparkles}>
                  <Select value={form.service} onValueChange={update("service")} required>
                    <SelectTrigger className="pl-11 h-12 bg-background/40 border-gold/20">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field icon={Calendar}>
                  <Input required type="date" value={form.date}
                    onChange={(e) => update("date")(e.target.value)} className="pl-11 h-12 bg-background/40 border-gold/20" />
                </Field>
                <Field icon={Clock}>
                  <Input required type="time" value={form.time}
                    onChange={(e) => update("time")(e.target.value)} className="pl-11 h-12 bg-background/40 border-gold/20" />
                </Field>
              </div>

              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 h-5 w-5 text-gold/70" />
                <Textarea
                  placeholder="Share your concern or what you'd like guidance on..."
                  value={form.message}
                  onChange={(e) => update("message")(e.target.value)}
                  className="pl-11 min-h-[110px] bg-background/40 border-gold/20"
                />
              </div>

              <Button type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground font-semibold text-base py-6 glow-gold hover:scale-[1.02] transition-transform">
                <Send className="mr-2 h-5 w-5" />
                Confirm Appointment via WhatsApp
              </Button>

              <p className="text-center text-xs text-cosmic-silver/60">
                Your details remain private. You'll be redirected to WhatsApp to finalize the slot.
              </p>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSuccessModal}
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
                <button
                  onClick={closeSuccessModal}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors text-cosmic-silver hover:text-gold"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mb-6 mx-auto glow-gold"
                  >
                    <CheckCircle className="w-10 h-10 text-primary-foreground" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-display text-2xl font-bold text-gradient-gold mb-3"
                  >
                    Appointment Request Sent!
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-xl p-4 mb-4"
                  >
                    <div className="text-xs text-cosmic-silver/60 mb-1">Your Booking Reference</div>
                    <div className="text-2xl font-bold text-gold tracking-wider">{bookingRef}</div>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-cosmic-silver/80 text-sm mb-4"
                  >
                    Your details have been sent to WhatsApp. We'll confirm your appointment shortly.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs text-cosmic-silver/50"
                  >
                    Save your booking reference for future correspondence.
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const Field = ({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) => (
  <div className="relative">
    <Icon className="absolute left-3.5 top-3.5 h-5 w-5 text-gold/70 z-10 pointer-events-none" />
    {children}
  </div>
);

export default BookingSection;
