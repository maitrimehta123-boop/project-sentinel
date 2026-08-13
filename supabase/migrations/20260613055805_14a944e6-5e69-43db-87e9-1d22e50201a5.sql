
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for auto-profile + default user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  category text,
  stock integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active products" ON public.products FOR SELECT USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  address text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
  payment_id text,
  razorpay_order_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ APPOINTMENTS ============
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  service text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.appointments TO anon, authenticated;
GRANT UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone creates appointment" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage appointments" ON public.appointments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ BLOG ============
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views published" ON public.blog_posts FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage blog" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER blog_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ GALLERY ============
CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  category text NOT NULL DEFAULT 'events', -- events, clients, spiritual, photos
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views gallery" ON public.gallery_items FOR SELECT USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ VIDEOS ============
CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id text NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  video_type text NOT NULL DEFAULT 'video', -- video, short
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ TESTIMONIALS ============
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  location text,
  rating integer NOT NULL DEFAULT 5,
  message text NOT NULL,
  avatar_url text,
  featured boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ CONTACT ============
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone sends message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ SEED DATA ============
INSERT INTO public.products (name, description, price, image_url, category, stock) VALUES
('Natural Rudraksha Mala (108 Beads)', 'Authentic 5-mukhi Rudraksha mala for meditation & peace. Energized with Vedic mantras.', 1999, 'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800', 'mala', 50),
('Yellow Sapphire (Pukhraj) - Certified', 'Lab-certified natural yellow sapphire 5.25 ratti. Boosts wisdom, wealth & Jupiter energies.', 12500, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 'gemstone', 10),
('Sphatik (Crystal) Shree Yantra', 'Hand-carved natural crystal Shree Yantra for prosperity and positive vibrations.', 3499, 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800', 'yantra', 25),
('Personalized Kundli Report (PDF)', 'In-depth 40-page Vedic birth chart analysis with predictions & remedies.', 999, 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=800', 'report', 999),
('Red Coral (Moonga) - Certified', 'Natural Italian red coral 6 ratti for Mars strengthening and courage.', 8999, 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800', 'gemstone', 15),
('Parad (Mercury) Shivling', 'Sacred Parad Shivling for spiritual healing & wealth attraction.', 5499, 'https://images.unsplash.com/photo-1604608672516-f1b9b1d1f1b1?w=800', 'spiritual', 20);

INSERT INTO public.testimonials (client_name, location, rating, message) VALUES
('Priya Sharma', 'Mumbai', 5, 'Hrishi ji ki predictions amazing thi! Career me jo bola wahi hua. Bahut accurate aur trustworthy.'),
('Rajesh Patel', 'Ahmedabad', 5, 'Marriage consultation se hamari shadi smoothly hui. Vastu guidance bhi bahut helpful tha.'),
('Anjali Mehta', 'Surat', 5, 'Best astrologer I have consulted. Genuine, kind and the remedies actually work!'),
('Vikram Singh', 'Delhi', 5, 'Business astrology ne mera business 3x growth diya. Highly recommended.'),
('Sneha Reddy', 'Hyderabad', 5, 'Numerology session was eye-opening. My name correction changed my luck completely.'),
('Amit Joshi', 'Pune', 5, 'Kundli reading was so detailed and precise. Worth every rupee.');

INSERT INTO public.blog_posts (slug, title, excerpt, content, cover_url) VALUES
('mercury-retrograde-2026', 'Mercury Retrograde 2026: What to Expect', 'Understand how Mercury retrograde affects communication, travel & decisions.', '# Mercury Retrograde 2026

Mercury retrograde is one of the most discussed astrological phenomena. In 2026, it occurs four times...

## What it means
When Mercury appears to move backward, communication, technology and travel can get disrupted.

## Remedies
- Wear an emerald
- Chant "Om Budhaya Namah" 108 times daily
- Donate green items on Wednesdays', 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=1200'),
('power-of-rudraksha', 'The Hidden Power of Rudraksha Beads', 'Discover the spiritual & scientific benefits of wearing Rudraksha.', '# The Power of Rudraksha

Rudraksha beads have been revered for thousands of years...

## Benefits
- Reduces stress & anxiety
- Balances blood pressure
- Enhances meditation
- Removes negative energies', 'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=1200'),
('vastu-tips-home', '7 Vastu Tips for a Prosperous Home', 'Simple Vastu adjustments that bring wealth and harmony.', '# Vastu Tips

Your home directly affects your destiny. Apply these tips...

1. Main door should face North or East
2. Kitchen in South-East
3. Master bedroom in South-West
4. No mirrors facing the bed
5. Keep North-East corner clean & open
6. Avoid clutter under stairs
7. Place a money plant in South-East', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200');

INSERT INTO public.gallery_items (image_url, caption, category) VALUES
('https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=800', 'Vedic Pooja Ceremony', 'spiritual'),
('https://images.unsplash.com/photo-1604608672516-9c2f2c2e1234?w=800', 'Live Astrology Event', 'events'),
('https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=800', 'Cosmic Energy Session', 'spiritual'),
('https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=800', 'Happy Client Consultation', 'clients'),
('https://images.unsplash.com/photo-1606327054536-e37e655d4f4d?w=800', 'Workshop in Ahmedabad', 'events'),
('https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800', 'Crystal Healing Setup', 'spiritual'),
('https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800', 'Sacred Rudraksha Collection', 'photos'),
('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800', 'Gemstone Ceremony', 'events');

INSERT INTO public.videos (youtube_id, title, description, category, video_type) VALUES
('dQw4w9WgXcQ', 'Daily Horoscope - Today''s Cosmic Energy', 'Quick daily reading for all 12 zodiac signs', 'horoscope', 'video'),
('jNQXAC9IVRw', 'How to Read Your Kundli', 'Beginner''s guide to understanding your birth chart', 'education', 'video'),
('9bZkp7q19f0', 'Powerful Mantras for Wealth', 'Chant these mantras for prosperity', 'mantra', 'short'),
('kJQP7kiw5Fk', 'Vastu Tips for Bedroom', 'Quick Vastu hacks for better sleep & love', 'vastu', 'short'),
('L_jWHffIx5E', 'Rudraksha Benefits Explained', 'Science meets spirituality', 'education', 'video'),
('fJ9rUzIMcZQ', 'Mercury Retrograde Survival Guide', '5 things to do during Mercury retrograde', 'horoscope', 'short');
