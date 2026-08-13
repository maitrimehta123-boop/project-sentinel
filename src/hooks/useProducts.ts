import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DBProduct } from "@/lib/shop";
import { CATALOG, catalogById } from "@/lib/catalog";

/** Newly launched product that is highlighted first in the shop. */
const FEATURED_ID = "trishield-bracelet";

export const useProducts = () => {
  // Start from the bundled catalog so the shop paints instantly (no skeleton flash),
  // then swap in database products when they exist.
  const [products, setProducts] = useState<DBProduct[]>(CATALOG);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    const rows = (data as unknown as DBProduct[]) ?? [];
    const featured = catalogById(FEATURED_ID);
    const base = rows.length ? rows : CATALOG;
    const hasFeatured = base.some((p) => p.name === featured?.name || p.id === FEATURED_ID);
    setProducts(featured && !hasFeatured ? [featured, ...base] : base);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { products, loading, reload: load };
};
