-- App entitlements for the multi-app suite
CREATE TABLE public.app_entitlements (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_slug text NOT NULL,
  status text NOT NULL DEFAULT 'trial',
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  PRIMARY KEY (user_id, app_slug)
);

GRANT SELECT ON public.app_entitlements TO authenticated;
GRANT ALL ON public.app_entitlements TO service_role;

ALTER TABLE public.app_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own entitlements"
  ON public.app_entitlements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Extend handle_new_user to grant SaborIA on signup (trial)
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

  INSERT INTO public.app_entitlements (user_id, app_slug, status)
  VALUES (NEW.id, 'saboria', 'trial')
  ON CONFLICT (user_id, app_slug) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Backfill existing users so nobody is locked out
INSERT INTO public.app_entitlements (user_id, app_slug, status)
SELECT id, 'saboria', 'trial' FROM auth.users
ON CONFLICT (user_id, app_slug) DO NOTHING;