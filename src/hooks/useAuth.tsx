import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (uid: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let pendingAdminCheck: Promise<void> | null = null;

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (!active) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        pendingAdminCheck = checkAdmin(sess.user.id);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!active) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        pendingAdminCheck = checkAdmin(sess.user.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    const timer = window.setTimeout(() => {
      if (active) setLoading(false);
    }, 2000);

    return () => {
      active = false;
      window.clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
