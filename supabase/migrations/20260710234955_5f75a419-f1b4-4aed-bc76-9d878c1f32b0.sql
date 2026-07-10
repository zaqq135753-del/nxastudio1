
ALTER TABLE public.app_entitlements
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'base'
  CHECK (tier IN ('base','prime'));

CREATE OR REPLACE FUNCTION public.claim_trial(_slug text, _tier text DEFAULT 'base')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _slug NOT IN ('saboria','socialia','petia','fluencyia','glowia','granaia','fitia','styleia','cosmosia','roteiroia') THEN
    RAISE EXCEPTION 'Invalid app slug: %', _slug;
  END IF;
  IF _tier NOT IN ('base','prime') THEN
    RAISE EXCEPTION 'Invalid tier: %', _tier;
  END IF;

  INSERT INTO public.app_entitlements (user_id, app_slug, status, expires_at, tier)
  VALUES (auth.uid(), _slug, 'trial', now() + interval '7 days', _tier)
  ON CONFLICT (user_id, app_slug) DO UPDATE
    SET tier = CASE
                 WHEN public.app_entitlements.tier = 'prime' THEN 'prime'
                 ELSE EXCLUDED.tier
               END,
        status = CASE
                   WHEN public.app_entitlements.status = 'canceled' THEN 'trial'
                   ELSE public.app_entitlements.status
                 END,
        expires_at = COALESCE(public.app_entitlements.expires_at, EXCLUDED.expires_at);
END;
$function$;
