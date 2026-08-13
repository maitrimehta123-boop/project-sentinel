/*
# Create storage bucket for admin-uploaded product images and testimonial avatars

1. Changes
- Creates a public storage bucket 'shop-images' for product photos.
- Creates a public storage bucket 'testimonials' for client review avatars.
- Sets RLS policies: anyone can read, only authenticated (admin) can upload/update/delete.
2. Security
- Public read access (public buckets).
- Write access restricted to authenticated users (admin).
*/

INSERT INTO storage.buckets (id, name, public) VALUES
  ('shop-images', 'shop-images', true),
  ('testimonials', 'testimonials', true)
ON CONFLICT (id) DO NOTHING;

-- shop-images policies
CREATE POLICY "Public read shop-images" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'shop-images');
CREATE POLICY "Auth upload shop-images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'shop-images');
CREATE POLICY "Auth update shop-images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'shop-images');
CREATE POLICY "Auth delete shop-images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'shop-images');

-- testimonials policies
CREATE POLICY "Public read testimonials" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'testimonials');
CREATE POLICY "Auth upload testimonials" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'testimonials');
CREATE POLICY "Auth update testimonials" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'testimonials');
CREATE POLICY "Auth delete testimonials" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'testimonials');