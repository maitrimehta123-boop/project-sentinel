/*
# Auto-grant admin role to the authorised admin email

1. Changes
- Updates the `handle_new_user()` trigger function so that when a new user
  signs up with the email `astrowithhrishi@gmail.com`, they are automatically
  assigned the `admin` role in `user_roles` instead of the default `user` role.
- All other new users continue to receive the `user` role as before.
2. Security
- No RLS or policy changes.
3. Notes
- Safe to re-run (CREATE OR REPLACE).
- The admin email is hard-coded per the site owner's request — only this
  specific email receives the admin role on sign-up.
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
  IF LOWER(NEW.email) = 'astrowithhrishi@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;
