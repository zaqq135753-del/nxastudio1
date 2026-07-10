
CREATE TABLE public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_slug text not null,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now(),
  unique (user_id, app_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_streaks TO authenticated;
GRANT ALL ON public.user_streaks TO service_role;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own streaks" ON public.user_streaks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_slug text not null,
  app_slug text,
  title text not null,
  description text,
  icon text,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own badges" ON public.user_badges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.app_entitlements
  ADD COLUMN IF NOT EXISTS plan text not null default 'trial',
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz default (now() + interval '7 days');
