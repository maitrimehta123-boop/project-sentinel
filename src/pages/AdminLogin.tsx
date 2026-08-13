import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * Standalone admin sign-in, intentionally unlinked from the customer site.
 * Authorisation is decided by the `user_roles` table (RLS protected), never by
 * anything stored in the frontend.
 */
const AdminLogin = () => {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Admin Sign In";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (user && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) return toast.error("Enter your credentials");
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });
    if (error || !data.user) {
      setBusy(false);
      return toast.error("Invalid credentials.");
    }
    // Authorisation check happens against the database role table.
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setBusy(false);
    if (!role) {
      await supabase.auth.signOut();
      return toast.error("Invalid credentials.");
    }
    toast.success("Welcome to the Admin Dashboard");
    nav("/admin", { replace: true });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO title="Admin Sign In" description="Restricted area." path="/admin/login" noindex />
      <form onSubmit={submit} className="glass-gold rounded-3xl p-7 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gold" />
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">Admin Access</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">Authorised administrators only.</p>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
          <Input
            required
            type="email"
            autoComplete="username"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="pl-10 h-12 bg-background/40 border-gold/20"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
          <Input
            required
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="pl-10 h-12 bg-background/40 border-gold/20"
          />
        </div>
        <Button disabled={busy} type="submit" size="lg" className="w-full bg-gradient-gold text-primary-foreground glow-gold">
          {busy ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </main>
  );
};

export default AdminLogin;
