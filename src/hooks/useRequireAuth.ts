import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

/** Blocks shopping actions for guests and sends them to login/register. */
export const useRequireAuth = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  return useCallback(() => {
    if (user) return true;
    toast.error("Please login or register to continue shopping");
    nav(`/auth?redirect=${encodeURIComponent(loc.pathname + loc.search)}`);
    return false;
  }, [user, nav, loc.pathname, loc.search]);
};
