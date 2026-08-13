/*
# Pre-create admin account and add phone-check function

1. Changes
- Creates the admin user (astrowithhrishi@gmail.com) with the specified
  bcrypt-hashed password (Astro@Hrishi#5565) if it does not already exist.
  The existing handle_new_user trigger auto-creates the profile and grants
  the admin role on INSERT.
- If the admin user already exists, updates the password to ensure it matches.
- Manually ensures the admin role and profile exist as a fallback.
- Creates check_phone_exists() SECURITY DEFINER function so the frontend can
  verify phone number uniqueness during customer registration.
2. Security
- check_phone_exists is SECURITY DEFINER but only returns a boolean — no
  profile data is leaked.
- No new RLS policies needed.
3. Notes
- Safe to re-run (DO block, CREATE OR REPLACE, IF NOT EXISTS).
- pgcrypto is available by default in Supabase for crypt() / gen_salt().
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE lower(email) = 'astrowithhrishi@gmail.com';

  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      aud,
      role,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'astrowithhrishi@gmail.com',
      crypt('Astro@Hrishi#5565', gen_salt('bf')),
      'authenticated',
      'authenticated',
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin"}'::jsonb
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Astro@Hrishi#5565', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now()
    WHERE id = admin_id;
  END IF;

  -- Ensure admin role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (admin_id, 'astrowithhrishi@gmail.com', 'Admin')
  ON CONFLICT (id) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.check_phone_exists(p_phone text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE phone = p_phone AND phone IS NOT NULL AND phone != ''
  )
$$;

GRANT EXECUTE ON FUNCTION public.check_phone_exists(text) TO anon, authenticated;