import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { User, Phone, Mail, Lock } from "lucide-react";

/** Customer-only login / registration. Admin sign-in lives on its own route. */
const Auth = () => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/shop";
  const [busy, setBusy] = useState(false);

  const [reg, setReg] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [log, setLog] = useState({ email: "", password: "" });

  if (loading)
    return (
      <PageLayout title="Sign In">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        </div>
      </PageLayout>
    );

  // Redirect already-logged-in users
  if (user) return <Navigate to={redirectTo} replace />;

  const register = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!reg.full_name.trim() || reg.full_name.trim().length < 2)
      return toast.error("Please enter your full name (min 2 characters)");
    if (!/^\S+@\S+\.\S+$/.test(reg.email.trim()))
      return toast.error("Please enter a valid email address");
    if (reg.phone.trim() && !/^[6-9]\d{9}$/.test(reg.phone.trim().replace(/\D/g, "").slice(-10)))
      return toast.error("Please enter a valid 10-digit mobile number");
    if (reg.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setBusy(true);

    // Check phone uniqueness if phone provided
    if (reg.phone.trim()) {
      const { data: phoneExists } = await supabase.rpc("check_phone_exists", {
        p_phone: reg.phone.trim(),
      });
      if (phoneExists) {
        setBusy(false);
        return toast.error("This mobile number is already registered. Please use a different number or login.");
      }
    }

    // Sign up — Supabase automatically rejects duplicate emails
    const { data, error } = await supabase.auth.signUp({
      email: reg.email.trim().toLowerCase(),
      password: reg.password,
      options: { data: { full_name: reg.full_name.trim(), phone: reg.phone.trim() } },
    });

    if (error) {
      setBusy(false);
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return toast.error("This email is already registered. Please login.");
      }
      if (msg.includes("weak") || msg.includes("pwned")) {
        return toast.error("This password is too common. Please choose a stronger password.");
      }
      if (msg.includes("rate limit") || msg.includes("too many")) {
        return toast.error("Too many attempts. Please wait a minute and try again.");
      }
      return toast.error(error.message);
    }

    if (data.user && data.session) {
      // Update profile with name and phone (trigger creates base profile)
      await supabase
        .from("profiles")
        .update({ full_name: reg.full_name.trim(), phone: reg.phone.trim() })
        .eq("id", data.user.id);
    }

    setBusy(false);

    // Email confirmation enabled → no session is returned; tell the user instead
    // of sending them to a page that still treats them as signed out.
    if (!data.session) {
      return toast.success("Account created! Please confirm your email, then log in.");
    }

    toast.success(`Account created! Welcome ${reg.full_name.trim().split(" ")[0]} 🎉`);
    nav(redirectTo);
  };

  const customerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!log.email.trim() || !log.password) return toast.error("Please enter email and password");

    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: log.email.trim().toLowerCase(),
      password: log.password,
    });
    setBusy(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials")) return toast.error("Invalid email or password.");
      if (msg.includes("not found") || msg.includes("no user")) return toast.error("Account not found. Please register first.");
      return toast.error(error.message);
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .maybeSingle();
      const name = profile?.full_name || data.user.email?.split("@")[0] || "Seeker";
      toast.success(`Welcome back, ${name.split(" ")[0]}! 👋`);
      nav(redirectTo);
    }
  };

  const field = (icon: React.ReactNode, input: React.ReactNode) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/70">{icon}</span>
      {input}
    </div>
  );

  return (
    <PageLayout title="Sign In">
      <SEO title="Sign In — Astro With Hrishi" description="Sign in to your Astro With Hrishi account to track orders and checkout securely." path="/auth" noindex />
      <div className="container max-w-md">
        <Tabs defaultValue="login">
          <TabsList className="grid grid-cols-2 w-full mb-4 bg-background/40 rounded-lg">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={customerLogin} className="glass-gold rounded-3xl p-6 space-y-4">
              <p className="text-sm text-cosmic-silver/70 text-center">Welcome back! Sign in to your account.</p>
              {field(<Mail className="h-4 w-4" />, <Input required type="email" placeholder="Email" value={log.email} onChange={(e) => setLog({ ...log, email: e.target.value })} className="pl-10 h-12 bg-background/40 border-gold/20" />)}
              {field(<Lock className="h-4 w-4" />, <Input required type="password" placeholder="Password" value={log.password} onChange={(e) => setLog({ ...log, password: e.target.value })} className="pl-10 h-12 bg-background/40 border-gold/20" />)}
              <Button disabled={busy} type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground glow-gold">{busy ? "Signing in..." : "Login"}</Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={register} className="glass-gold rounded-3xl p-6 space-y-4">
              <p className="text-sm text-cosmic-silver/70 text-center">Create a free account to get personalised consultations.</p>
              {field(<User className="h-4 w-4" />, <Input required placeholder="Full Name" value={reg.full_name} onChange={(e) => setReg({ ...reg, full_name: e.target.value })} className="pl-10 h-12 bg-background/40 border-gold/20" />)}
              {field(<Mail className="h-4 w-4" />, <Input required type="email" placeholder="Email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} className="pl-10 h-12 bg-background/40 border-gold/20" />)}
              {field(<Phone className="h-4 w-4" />, <Input type="tel" placeholder="Phone Number" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} className="pl-10 h-12 bg-background/40 border-gold/20" />)}
              {field(<Lock className="h-4 w-4" />, <Input required type="password" placeholder="Password (min 6 characters)" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} className="pl-10 h-12 bg-background/40 border-gold/20" />)}
              <Button disabled={busy} type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground glow-gold">{busy ? "Creating account..." : "Register"}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Auth;
