
-- 1) generated content (captions, ideas, video scripts, analysis)
CREATE TABLE public.social_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,           -- caption | idea | video_script | analysis
  title TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_contents TO authenticated;
GRANT ALL ON public.social_contents TO service_role;
ALTER TABLE public.social_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own social_contents" ON public.social_contents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX social_contents_user_created_idx ON public.social_contents(user_id, created_at DESC);

-- 2) editorial calendars
CREATE TABLE public.social_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  niche TEXT,
  frequency TEXT,
  duration TEXT,
  goals JSONB,
  posts JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_calendars TO authenticated;
GRANT ALL ON public.social_calendars TO service_role;
ALTER TABLE public.social_calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own social_calendars" ON public.social_calendars
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3) saved hashtag sets
CREATE TABLE public.social_hashtag_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hashtags JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_hashtag_sets TO authenticated;
GRANT ALL ON public.social_hashtag_sets TO service_role;
ALTER TABLE public.social_hashtag_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own social_hashtag_sets" ON public.social_hashtag_sets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) grant SocialIA entitlement to new users too (dev/demo)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  VALUES (NEW.id, 'saboria', 'active'), (NEW.id, 'socialia', 'active')
  ON CONFLICT (user_id, app_slug) DO NOTHING;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- backfill existing users
INSERT INTO public.app_entitlements (user_id, app_slug, status)
SELECT id, 'socialia', 'active' FROM auth.users
ON CONFLICT (user_id, app_slug) DO NOTHING;
