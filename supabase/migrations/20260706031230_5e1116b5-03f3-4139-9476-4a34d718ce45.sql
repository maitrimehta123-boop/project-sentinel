CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone views active products" ON public.products;
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Anyone views active products" ON public.products FOR SELECT TO public USING (active = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone creates appointment" ON public.appointments;
CREATE POLICY "Anyone creates appointment" ON public.appointments FOR INSERT TO public WITH CHECK (
  length(trim(name)) >= 2
  AND length(trim(phone)) >= 8
  AND length(trim(service)) >= 2
  AND length(trim(appointment_time)) >= 2
  AND appointment_date IS NOT NULL
);
CREATE POLICY "Admins manage appointments" ON public.appointments FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone views published" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins manage blog" ON public.blog_posts;
CREATE POLICY "Anyone views published" ON public.blog_posts FOR SELECT TO public USING (published = true);
CREATE POLICY "Admins manage blog" ON public.blog_posts FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage gallery" ON public.gallery_items;
CREATE POLICY "Admins manage gallery" ON public.gallery_items FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage videos" ON public.videos;
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone sends message" ON public.contact_messages;
CREATE POLICY "Anyone sends message" ON public.contact_messages FOR INSERT TO public WITH CHECK (
  length(trim(name)) >= 2
  AND length(trim(email)) >= 5
  AND position('@' in email) > 1
  AND length(trim(message)) >= 10
);
CREATE POLICY "Admins view messages" ON public.contact_messages FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon, authenticated;