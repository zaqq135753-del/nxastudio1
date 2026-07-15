ALTER TABLE public.app_pricing_overrides
  ADD COLUMN IF NOT EXISTS checkout_url_base TEXT,
  ADD COLUMN IF NOT EXISTS checkout_url_prime TEXT;