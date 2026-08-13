import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, MapPin, Phone, ShieldCheck, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { welcomeCustomer } from "@/lib/voice";
import { toast } from "sonner";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Jammu & Kashmir", "Ladakh",
  "Puducherry", "Chandigarh", "Andaman & Nicobar Islands", "Dadra & Nagar Haveli and Daman & Diu", "Lakshadweep",
];

const emptyReg = {
  full_name: "",
  phone: "",
  email: "",
  password: "",
  confirm: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  address: "",
};

const Field = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="relative">
    {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/70">{icon}</span>}
    {children}
  </div>
);

const inputClass = "h-11 bg-background/40 border-gold/20 text-cosmic-silver placeholder:text-cosmic-silver/40";

/** Full-screen gate shown on the Shop page until the visitor is authenticated. */
const ShopAuthGate = () => {
  const [busy, setBusy] = useState(false);
  const [reg, setReg] = useState(emptyReg);
  const [log, setLog] = useState({ email: "", password: "" });

  const afterAuth = async (name: string, userId: string, email: string) => {
    await supabase.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", userId);
    await supabase.from("login_history").insert({ user_id: userId, email });
    toast.success(`Welcome, ${name} 👋`);
    welcomeCustomer(name);
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = reg;
    if (!r.full_name.trim() || r.full_name.trim().length < 2) return toast.error("Please enter your full name");
    if (!/^[6-9]\d{9}$/.test(r.phone.replace(/\D/g, "").slice(-10)))
      return toast.error("Enter a valid 10-digit Indian mobile number");
    if (!/^\S+@\S+\.\S+$/.test(r.email.trim())) return toast.error("Enter a valid email address");
    if (r.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (r.password !== r.confirm) return toast.error("Passwords do not match");
    if (!r.city.trim() || !r.state.trim() || !r.country.trim()) return toast.error("City, state and country are required");
    if (!/^\d{6}$/.test(r.pincode.trim())) return toast.error("Enter a valid 6-digit pincode");
    if (r.address.trim().length < 10) return toast.error("Please enter your complete address");

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: r.email.trim().toLowerCase(),
      password: r.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: r.full_name.trim(),
          phone: r.phone.trim(),
          city: r.city.trim(),
          state: r.state.trim(),
          country: r.country.trim(),
          pincode: r.pincode.trim(),
          address: r.address.trim(),
        },
      },
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    if (data.user) {
      await supabase.from("addresses").insert({
        user_id: data.user.id,
        label: "Home",
        full_name: r.full_name.trim(),
        phone: r.phone.trim(),
        email: r.email.trim().toLowerCase(),
        address: r.address.trim(),
        city: r.city.trim(),
        state: r.state.trim(),
        pincode: r.pincode.trim(),
        country: r.country.trim(),
        is_default: true,
      });
      await afterAuth(r.full_name.trim(), data.user.id, r.email.trim().toLowerCase());
    }
    setBusy(false);
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: log.email.trim().toLowerCase(),
      password: log.password,
    });
    setBusy(false);
    if (error) return toast.error("Invalid email or password.");
    if (data.user) {
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle();
      const name = p?.full_name || data.user.email?.split("@")[0] || "Seeker";
      await afterAuth(name, data.user.id, data.user.email ?? "");
    }
  };

  return (
    <section className="container max-w-2xl pt-36 pb-24">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-5">
          <Lock className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs tracking-[0.28em] uppercase text-gold">Members Only Store</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-gradient-gold mb-3">Sacred Store Access</h1>
        <p className="text-cosmic-silver/75 max-w-lg mx-auto">
          Create your free account or sign in to browse and order authentic spiritual products.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Tabs defaultValue="register">
          <TabsList className="glass-gold grid grid-cols-2 w-full mb-5">
            <TabsTrigger value="register" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground">
              Register
            </TabsTrigger>
            <TabsTrigger value="login" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground">
              Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <form onSubmit={register} className="glass-gold rounded-3xl p-6 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field icon={<User className="h-4 w-4" />}>
                  <Input required placeholder="Full Name" value={reg.full_name} onChange={(e) => setReg({ ...reg, full_name: e.target.value })} className={`pl-10 ${inputClass}`} />
                </Field>
                <Field icon={<Phone className="h-4 w-4" />}>
                  <Input required type="tel" inputMode="numeric" maxLength={10} placeholder="Mobile Number" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} className={`pl-10 ${inputClass}`} />
                </Field>
              </div>

              <Field icon={<Mail className="h-4 w-4" />}>
                <Input required type="email" placeholder="Email Address" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} className={`pl-10 ${inputClass}`} />
              </Field>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field icon={<Lock className="h-4 w-4" />}>
                  <Input required type="password" placeholder="Password (min 8 chars)" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} className={`pl-10 ${inputClass}`} />
                </Field>
                <Field icon={<ShieldCheck className="h-4 w-4" />}>
                  <Input required type="password" placeholder="Confirm Password" value={reg.confirm} onChange={(e) => setReg({ ...reg, confirm: e.target.value })} className={`pl-10 ${inputClass}`} />
                </Field>
              </div>

              <div className="pt-1 text-[11px] uppercase tracking-[0.2em] text-gold/70">Delivery Details</div>

              <Field icon={<MapPin className="h-4 w-4" />}>
                <Input required placeholder="Complete Address (house, street, area)" value={reg.address} onChange={(e) => setReg({ ...reg, address: e.target.value })} className={`pl-10 ${inputClass}`} />
              </Field>

              <div className="grid sm:grid-cols-2 gap-3">
                <Input required placeholder="City" value={reg.city} onChange={(e) => setReg({ ...reg, city: e.target.value })} className={inputClass} />
                <select
                  required
                  value={reg.state}
                  onChange={(e) => setReg({ ...reg, state: e.target.value })}
                  className="h-11 rounded-md bg-background/40 border border-gold/20 px-3 text-sm text-cosmic-silver"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s} className="bg-background">{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Input required inputMode="numeric" maxLength={6} placeholder="Pincode" value={reg.pincode} onChange={(e) => setReg({ ...reg, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className={inputClass} />
                <Input required placeholder="Country" value={reg.country} onChange={(e) => setReg({ ...reg, country: e.target.value })} className={inputClass} />
              </div>

              <Button disabled={busy} type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground font-semibold glow-gold h-12">
                {busy ? "Creating your account..." : "Create Account & Enter Store"}
              </Button>
              <p className="text-[11px] text-center text-cosmic-silver/50">
                <Sparkles className="inline h-3 w-3 text-gold mr-1" />
                Your details are stored securely and used only for delivery.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="login">
            <form onSubmit={login} className="glass-gold rounded-3xl p-6 space-y-4">
              <p className="text-sm text-cosmic-silver/70 text-center">Welcome back! Sign in to continue shopping.</p>
              <Field icon={<Mail className="h-4 w-4" />}>
                <Input required type="email" placeholder="Email" value={log.email} onChange={(e) => setLog({ ...log, email: e.target.value })} className={`pl-10 ${inputClass}`} />
              </Field>
              <Field icon={<Lock className="h-4 w-4" />}>
                <Input required type="password" placeholder="Password" value={log.password} onChange={(e) => setLog({ ...log, password: e.target.value })} className={`pl-10 ${inputClass}`} />
              </Field>
              <Button disabled={busy} type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground font-semibold glow-gold h-12">
                {busy ? "Signing in..." : "Login & Enter Store"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </section>
  );
};

export default ShopAuthGate;
export { INDIAN_STATES };
