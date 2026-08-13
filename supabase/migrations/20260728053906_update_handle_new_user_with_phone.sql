/*
# Update new-user trigger to capture phone

1. Changes
- Replaces the `handle_new_user()` trigger function so that the `phone` field
  from sign-up metadata is also written to the `profiles` table.
- No new tables, no columns changed (phone column already exists).
2. Security
- No RLS or policy changes.
3. Notes
- Safe to re-run (CREATE OR REPLACE).
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
