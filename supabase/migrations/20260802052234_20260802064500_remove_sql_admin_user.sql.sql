/*
# Remove SQL-inserted admin user so GoTrue can create it properly

The admin user was inserted directly into auth.users via SQL, which GoTrue
(Supabase Auth) doesn't recognize properly. This deletes that user so the
edge function can create it via the GoTrue admin API instead.
*/

DELETE FROM auth.users WHERE lower(email) = 'astrowithhrishi@gmail.com';