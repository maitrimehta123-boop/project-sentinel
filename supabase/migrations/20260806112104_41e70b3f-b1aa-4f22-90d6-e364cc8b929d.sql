DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "public read products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT TO anon, authenticated
USING (active = true);
GRANT SELECT ON public.products TO anon, authenticated;