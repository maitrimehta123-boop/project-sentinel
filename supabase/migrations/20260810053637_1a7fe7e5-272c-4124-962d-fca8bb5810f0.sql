CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payment_id text,
  razorpay_order_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view payment events" ON public.payment_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_id_key ON public.orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_id_key ON public.orders (payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);