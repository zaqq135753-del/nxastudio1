
-- Stop auto-granting saboria on signup — apps are now individual purchases
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Allow the signed-in user to claim a trial of any valid NXA app
CREATE OR REPLACE FUNCTION public.claim_trial(_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _slug NOT IN ('saboria','socialia','petia','fluencyia','glowia','granaia','fitia','styleia','cosmosia','roteiroia') THEN
    RAISE EXCEPTION 'Invalid app slug: %', _slug;
  END IF;
  INSERT INTO public.app_entitlements (user_id, app_slug, status, expires_at)
  VALUES (auth.uid(), _slug, 'trial', now() + interval '7 days')
  ON CONFLICT (user_id, app_slug) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_trial(text) TO authenticated;
