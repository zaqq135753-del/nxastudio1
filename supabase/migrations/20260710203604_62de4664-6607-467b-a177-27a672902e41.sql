
-- XP e nível por usuário
CREATE TABLE public.user_xp (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_xp TO authenticated;
GRANT ALL ON public.user_xp TO service_role;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "xp readable by all authed (leaderboard)" ON public.user_xp
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "user updates own xp" ON public.user_xp
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user inserts own xp" ON public.user_xp
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Feed social
CREATE TABLE public.feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_slug TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'share',
  title TEXT NOT NULL,
  body TEXT,
  media_url TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feed_posts TO authenticated;
GRANT ALL ON public.feed_posts TO service_role;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feed readable by authed" ON public.feed_posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "user creates own posts" ON public.feed_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user deletes own posts" ON public.feed_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX feed_posts_created_at_idx ON public.feed_posts (created_at DESC);

-- Likes
CREATE TABLE public.feed_likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
GRANT SELECT, INSERT, DELETE ON public.feed_likes TO authenticated;
GRANT ALL ON public.feed_likes TO service_role;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes readable by authed" ON public.feed_likes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "user manages own likes" ON public.feed_likes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger para contador de likes
CREATE OR REPLACE FUNCTION public.feed_likes_count_trg()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER feed_likes_count
AFTER INSERT OR DELETE ON public.feed_likes
FOR EACH ROW EXECUTE FUNCTION public.feed_likes_count_trg();
