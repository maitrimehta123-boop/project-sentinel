-- ============================================================================
-- Complete Order Tracking + Admin Order Management
-- Extends the EXISTING public.orders table. Nothing is dropped or renamed.
-- Safe to run more than once.
-- ============================================================================

-- ── 0. admin helper (reads the existing user_roles table) ────────────────────
create or replace function public.is_order_admin(_uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _uid and role::text = 'admin'
  )
$$;
revoke execute on function public.is_order_admin(uuid) from public, anon;
grant execute on function public.is_order_admin(uuid) to authenticated, service_role;

-- ── 1. extra tracking columns on the existing orders table ───────────────────
alter table public.orders
  add column if not exists courier_name text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists estimated_delivery_date date,
  add column if not exists shipping_note text,
  add column if not exists cancellation_reason text,
  add column if not exists payment_reference text;

-- ── 2. guaranteed-unique human readable order number ─────────────────────────
create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare candidate text;
begin
  loop
    candidate := 'ORD-' || upper(encode(gen_random_bytes(4), 'hex'));
    exit when not exists (select 1 from public.orders where order_number = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function public.orders_set_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_number is null or btrim(new.order_number) = '' then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_order_number on public.orders;
create trigger trg_orders_order_number
  before insert on public.orders
  for each row execute function public.orders_set_order_number();

update public.orders
   set order_number = public.generate_order_number()
 where order_number is null or btrim(order_number) = '';

create unique index if not exists orders_order_number_key on public.orders (order_number);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- ── 3. order_items — immutable snapshot of what was bought ───────────────────
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  product_image text,
  quantity integer not null default 1 check (quantity > 0),
  price numeric not null default 0,
  subtotal numeric not null default 0,
  variant text,
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;

drop policy if exists "Customers view own order items" on public.order_items;
create policy "Customers view own order items" on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "Admins view all order items" on public.order_items;
create policy "Admins view all order items" on public.order_items
  for select to authenticated using (public.is_order_admin());

drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items" on public.order_items
  for all to authenticated using (public.is_order_admin()) with check (public.is_order_admin());

-- keep order_items in sync with the jsonb items the checkout already writes
create or replace function public.orders_sync_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare it jsonb;
begin
  if new.items is null or jsonb_typeof(new.items) <> 'array' then
    return new;
  end if;
  if tg_op = 'UPDATE' and new.items is not distinct from old.items then
    return new;
  end if;
  if exists (select 1 from public.order_items where order_id = new.id) then
    return new; -- snapshot already taken, never overwrite history
  end if;
  for it in select * from jsonb_array_elements(new.items) loop
    insert into public.order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal, variant)
    values (
      new.id,
      it->>'product_id',
      coalesce(it->>'name', 'Item'),
      coalesce(it->>'image_url', it->>'image'),
      coalesce((it->>'quantity')::int, 1),
      coalesce((it->>'price')::numeric, 0),
      coalesce((it->>'price')::numeric, 0) * coalesce((it->>'quantity')::int, 1),
      it->>'variant'
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_orders_sync_items on public.orders;
create trigger trg_orders_sync_items
  after insert or update of items on public.orders
  for each row execute function public.orders_sync_items();

-- backfill existing orders
insert into public.order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal, variant)
select o.id,
       it->>'product_id',
       coalesce(it->>'name', 'Item'),
       coalesce(it->>'image_url', it->>'image'),
       coalesce((it->>'quantity')::int, 1),
       coalesce((it->>'price')::numeric, 0),
       coalesce((it->>'price')::numeric, 0) * coalesce((it->>'quantity')::int, 1),
       it->>'variant'
from public.orders o
cross join lateral jsonb_array_elements(case when jsonb_typeof(o.items) = 'array' then o.items else '[]'::jsonb end) it
where not exists (select 1 from public.order_items oi where oi.order_id = o.id);

-- ── 4. order_status_history — append only ────────────────────────────────────
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  old_status text,
  new_status text not null,
  note text,
  changed_by uuid references auth.users(id) on delete set null,
  changed_by_label text,
  changed_at timestamptz not null default now()
);
create index if not exists order_status_history_order_idx on public.order_status_history (order_id, changed_at);

grant select on public.order_status_history to authenticated;
grant all on public.order_status_history to service_role;
alter table public.order_status_history enable row level security;

drop policy if exists "Customers view own order history" on public.order_status_history;
create policy "Customers view own order history" on public.order_status_history
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "Admins view all order history" on public.order_status_history;
create policy "Admins view all order history" on public.order_status_history
  for select to authenticated using (public.is_order_admin());

-- history is written by triggers/RPC only: no insert/update/delete policy exists.

create or replace function public.orders_log_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, old_status, new_status, note, changed_by)
    values (new.id, null, coalesce(new.status, 'placed'), 'Order placed', new.user_id);
  elsif new.status is distinct from old.status then
    insert into public.order_status_history (order_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_log_status on public.orders;
create trigger trg_orders_log_status
  after insert or update of status on public.orders
  for each row execute function public.orders_log_status();

-- seed history for orders that predate this migration
insert into public.order_status_history (order_id, old_status, new_status, note, changed_at)
select o.id, null, coalesce(o.status, 'placed'), 'Imported', o.created_at
from public.orders o
where not exists (select 1 from public.order_status_history h where h.order_id = o.id);

-- keep updated_at fresh
create or replace function public.orders_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;
drop trigger if exists trg_orders_touch on public.orders;
create trigger trg_orders_touch before update on public.orders
  for each row execute function public.orders_touch_updated_at();

-- ── 5. internal admin notes (never readable by customers) ────────────────────
create table if not exists public.order_admin_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists order_admin_notes_order_idx on public.order_admin_notes (order_id, created_at desc);

grant select, insert, delete on public.order_admin_notes to authenticated;
grant all on public.order_admin_notes to service_role;
alter table public.order_admin_notes enable row level security;

drop policy if exists "Admins read notes" on public.order_admin_notes;
create policy "Admins read notes" on public.order_admin_notes
  for select to authenticated using (public.is_order_admin());
drop policy if exists "Admins write notes" on public.order_admin_notes;
create policy "Admins write notes" on public.order_admin_notes
  for insert to authenticated with check (public.is_order_admin());
drop policy if exists "Admins delete notes" on public.order_admin_notes;
create policy "Admins delete notes" on public.order_admin_notes
  for delete to authenticated using (public.is_order_admin());

-- ── 6. status vocabulary + transition rules ──────────────────────────────────
create or replace function public.normalize_order_status(_status text)
returns text language sql immutable as $$
  select case lower(coalesce(_status, ''))
    when 'pending_payment' then 'placed'
    when 'created' then 'placed'
    when 'paid' then 'payment_confirmed'
    when 'payment_authenticated' then 'payment_confirmed'
    when 'payment_failed' then 'payment_failed'
    when 'confirmed' then 'confirmed'
    when 'canceled' then 'cancelled'
    when '' then 'placed'
    else lower(_status)
  end
$$;

create or replace function public.order_status_rank(_status text)
returns integer language sql immutable as $$
  select case public.normalize_order_status(_status)
    when 'placed' then 0
    when 'payment_confirmed' then 1
    when 'confirmed' then 2
    when 'processing' then 3
    when 'packed' then 4
    when 'shipped' then 5
    when 'out_for_delivery' then 6
    when 'delivered' then 7
    else -1
  end
$$;

-- ── 7. admin RPCs (single place that mutates tracking data) ──────────────────
create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text,
  p_note text default null,
  p_cancellation_reason text default null
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders;
  v_new text := public.normalize_order_status(p_status);
  v_old text;
  v_old_rank int;
  v_new_rank int;
begin
  if not public.is_order_admin() then raise exception 'not_authorised' using errcode = '42501'; end if;
  if v_new not in ('placed','payment_confirmed','confirmed','processing','packed','shipped',
                   'out_for_delivery','delivered','cancelled','payment_failed','refund_initiated','refunded') then
    raise exception 'invalid_status';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;

  v_old := public.normalize_order_status(v_order.status);
  if v_old = v_new then return v_order; end if;

  v_old_rank := public.order_status_rank(v_old);
  v_new_rank := public.order_status_rank(v_new);

  -- block invalid moves: no going backwards through the fulfilment chain,
  -- and terminal states cannot be re-opened (only refunded).
  if v_old_rank >= 0 and v_new_rank >= 0 and v_new_rank < v_old_rank then
    raise exception 'invalid_transition';
  end if;
  if v_old in ('refunded') then raise exception 'invalid_transition'; end if;
  if v_old = 'cancelled' and v_new not in ('refund_initiated','refunded') then
    raise exception 'invalid_transition';
  end if;
  if v_old = 'delivered' and v_new not in ('refund_initiated','refunded') then
    raise exception 'invalid_transition';
  end if;

  update public.orders set
    status = v_new,
    cancellation_reason = case when v_new = 'cancelled' then coalesce(p_cancellation_reason, cancellation_reason) else cancellation_reason end,
    payment_status = case
      when v_new = 'refunded' then 'refunded'
      when v_new = 'payment_failed' then 'failed'
      else payment_status end,
    updated_at = now()
  where id = p_order_id
  returning * into v_order;

  -- the status trigger already inserted the row; attach the admin note to it
  if p_note is not null and btrim(p_note) <> '' then
    update public.order_status_history
       set note = p_note
     where id = (select id from public.order_status_history
                  where order_id = p_order_id order by changed_at desc limit 1);
  end if;

  return v_order;
end;
$$;
revoke execute on function public.admin_update_order_status(uuid, text, text, text) from public, anon;
grant execute on function public.admin_update_order_status(uuid, text, text, text) to authenticated;

create or replace function public.admin_update_order_shipping(
  p_order_id uuid,
  p_courier_name text default null,
  p_tracking_number text default null,
  p_tracking_url text default null,
  p_estimated_delivery_date date default null,
  p_shipping_note text default null
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare v_order public.orders;
begin
  if not public.is_order_admin() then raise exception 'not_authorised' using errcode = '42501'; end if;
  if p_tracking_url is not null and btrim(p_tracking_url) <> ''
     and p_tracking_url !~* '^https?://' then
    raise exception 'invalid_tracking_url';
  end if;

  update public.orders set
    courier_name = nullif(btrim(coalesce(p_courier_name, courier_name, '')), ''),
    tracking_number = nullif(btrim(coalesce(p_tracking_number, tracking_number, '')), ''),
    tracking_url = nullif(btrim(coalesce(p_tracking_url, tracking_url, '')), ''),
    estimated_delivery_date = coalesce(p_estimated_delivery_date, estimated_delivery_date),
    shipping_note = nullif(btrim(coalesce(p_shipping_note, shipping_note, '')), ''),
    updated_at = now()
  where id = p_order_id
  returning * into v_order;

  if not found then raise exception 'order_not_found'; end if;
  return v_order;
end;
$$;
revoke execute on function public.admin_update_order_shipping(uuid, text, text, text, date, text) from public, anon;
grant execute on function public.admin_update_order_shipping(uuid, text, text, text, date, text) to authenticated;

-- ── 8. public tracking lookup (order number + email/phone) ───────────────────
create table if not exists public.order_lookup_attempts (
  id bigserial primary key,
  fingerprint text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists order_lookup_attempts_idx on public.order_lookup_attempts (fingerprint, attempted_at desc);
alter table public.order_lookup_attempts enable row level security;
grant all on public.order_lookup_attempts to service_role;
-- no policies: only the security-definer lookup function touches this table.

create or replace function public.track_order(p_order_number text, p_contact text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders;
  v_contact text := lower(btrim(coalesce(p_contact, '')));
  v_digits text := regexp_replace(coalesce(p_contact, ''), '\D', '', 'g');
  v_number text := upper(btrim(coalesce(p_order_number, '')));
  v_fp text;
  v_attempts int;
begin
  if v_number = '' or v_contact = '' then
    return jsonb_build_object('error', 'invalid_input');
  end if;

  -- enumeration protection: 10 lookups per contact per 15 minutes
  v_fp := md5(v_contact);
  delete from public.order_lookup_attempts where attempted_at < now() - interval '1 day';
  select count(*) into v_attempts from public.order_lookup_attempts
   where fingerprint = v_fp and attempted_at > now() - interval '15 minutes';
  if v_attempts >= 10 then
    return jsonb_build_object('error', 'rate_limited');
  end if;
  insert into public.order_lookup_attempts (fingerprint) values (v_fp);

  select * into v_order from public.orders
   where upper(order_number) = v_number
     and (
       lower(coalesce(customer_email, '')) = v_contact
       or (length(v_digits) >= 10 and right(regexp_replace(coalesce(customer_phone, ''), '\D', '', 'g'), 10) = right(v_digits, 10))
     )
   limit 1;

  if not found then
    return jsonb_build_object('error', 'not_found');
  end if;

  return jsonb_build_object(
    'order', jsonb_build_object(
      'id', v_order.id,
      'order_number', v_order.order_number,
      'created_at', v_order.created_at,
      'status', public.normalize_order_status(v_order.status),
      'payment_status', v_order.payment_status,
      'payment_method', v_order.payment_method,
      'customer_name', v_order.customer_name,
      'address', v_order.address,
      'city', v_order.city,
      'state', v_order.state,
      'pincode', v_order.pincode,
      'subtotal', v_order.subtotal,
      'shipping', v_order.shipping,
      'discount', v_order.discount,
      'total', v_order.total,
      'courier_name', v_order.courier_name,
      'tracking_number', v_order.tracking_number,
      'tracking_url', v_order.tracking_url,
      'estimated_delivery_date', v_order.estimated_delivery_date,
      'shipping_note', v_order.shipping_note,
      'cancellation_reason', v_order.cancellation_reason
    ),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name, 'product_image', oi.product_image,
        'quantity', oi.quantity, 'price', oi.price, 'subtotal', oi.subtotal, 'variant', oi.variant)
        order by oi.created_at)
      from public.order_items oi where oi.order_id = v_order.id), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(jsonb_build_object(
        'new_status', public.normalize_order_status(h.new_status),
        'note', h.note, 'changed_at', h.changed_at) order by h.changed_at)
      from public.order_status_history h where h.order_id = v_order.id), '[]'::jsonb)
  );
end;
$$;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- ── 9. realtime ──────────────────────────────────────────────────────────────
alter table public.orders replica identity full;
do $$
begin
  begin
    alter publication supabase_realtime add table public.orders;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.order_status_history;
  exception when duplicate_object then null;
  end;
end $$;
