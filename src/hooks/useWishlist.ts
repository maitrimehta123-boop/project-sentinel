import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Database-backed wishlist, scoped to the signed-in customer. */
export const useDbWishlist = () => {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!user) return setIds([]);
    const { data } = await supabase.from("wishlist_items").select("product_id").eq("user_id", user.id);
    setIds((data ?? []).map((r: { product_id: string }) => r.product_id));
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const has = (productId: string) => ids.includes(productId);

  const toggle = async (productId: string) => {
    if (!user) return;
    if (has(productId)) {
      setIds((s) => s.filter((i) => i !== productId));
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
    } else {
      setIds((s) => [...s, productId]);
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
    }
  };

  return { ids, has, toggle, reload: load };
};
