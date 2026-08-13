/*
# Fix admin password hash for GoTrue compatibility

GoTrue (Supabase Auth) uses bcrypt with cost factor 10 by default.
The previous migration used cost factor 6 which GoTrue may not verify
correctly. This updates the admin password hash with cost factor 10.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users
SET encrypted_password = crypt('Astro@Hrishi#5565', gen_salt('bf', 10)),
    updated_at = now()
WHERE lower(email) = 'astrowithhrishi@gmail.com';