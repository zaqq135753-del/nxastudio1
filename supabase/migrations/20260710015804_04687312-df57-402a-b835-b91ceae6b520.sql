
-- ============ FluencyIA ============
CREATE TABLE public.lang_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_lang TEXT NOT NULL DEFAULT 'en',
  level TEXT NOT NULL DEFAULT 'A1',
  daily_goal_min INT NOT NULL DEFAULT 15,
  streak INT NOT NULL DEFAULT 0,
  last_active DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_lang)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lang_profile TO authenticated;
GRANT ALL ON public.lang_profile TO service_role;
ALTER TABLE public.lang_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lang_profile" ON public.lang_profile FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.lang_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_lang TEXT NOT NULL,
  term TEXT NOT NULL,
  translation TEXT NOT NULL,
  example TEXT,
  ease INT NOT NULL DEFAULT 0,
  next_review DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lang_vocabulary TO authenticated;
GRANT ALL ON public.lang_vocabulary TO service_role;
ALTER TABLE public.lang_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lang_vocab" ON public.lang_vocabulary FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.lang_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_lang TEXT NOT NULL,
  kind TEXT NOT NULL,
  duration_min INT NOT NULL DEFAULT 0,
  accuracy INT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lang_sessions TO authenticated;
GRANT ALL ON public.lang_sessions TO service_role;
ALTER TABLE public.lang_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lang_sessions" ON public.lang_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ GlowIA ============
CREATE TABLE public.skin_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  skin_type TEXT,
  concerns TEXT[],
  allergies TEXT[],
  age INT,
  climate TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skin_profile TO authenticated;
GRANT ALL ON public.skin_profile TO service_role;
ALTER TABLE public.skin_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skin_profile" ON public.skin_profile FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.skin_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  period TEXT NOT NULL,
  steps JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skin_routines TO authenticated;
GRANT ALL ON public.skin_routines TO service_role;
ALTER TABLE public.skin_routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skin_routines" ON public.skin_routines FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  image_url TEXT,
  diagnosis JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skin_analyses TO authenticated;
GRANT ALL ON public.skin_analyses TO service_role;
ALTER TABLE public.skin_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own skin_analyses" ON public.skin_analyses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ GranaIA ============
CREATE TABLE public.fin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_transactions TO authenticated;
GRANT ALL ON public.fin_transactions TO service_role;
ALTER TABLE public.fin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fin_tx" ON public.fin_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX fin_tx_user_date ON public.fin_transactions(user_id, occurred_on DESC);

CREATE TABLE public.fin_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category TEXT NOT NULL,
  monthly_limit NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_budgets TO authenticated;
GRANT ALL ON public.fin_budgets TO service_role;
ALTER TABLE public.fin_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fin_budgets" ON public.fin_budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.fin_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  saved_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_goals TO authenticated;
GRANT ALL ON public.fin_goals TO service_role;
ALTER TABLE public.fin_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fin_goals" ON public.fin_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ FitIA ============
CREATE TABLE public.fit_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  goal TEXT,
  fitness_level TEXT,
  equipment TEXT[],
  restrictions TEXT,
  weight NUMERIC(5,2),
  height NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fit_profile TO authenticated;
GRANT ALL ON public.fit_profile TO service_role;
ALTER TABLE public.fit_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fit_profile" ON public.fit_profile FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.fit_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  focus TEXT,
  duration_min INT,
  difficulty TEXT,
  exercises JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fit_workouts TO authenticated;
GRANT ALL ON public.fit_workouts TO service_role;
ALTER TABLE public.fit_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fit_workouts" ON public.fit_workouts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.fit_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  workout_id UUID REFERENCES public.fit_workouts ON DELETE SET NULL,
  duration_min INT NOT NULL DEFAULT 0,
  calories INT,
  notes TEXT,
  completed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fit_sessions TO authenticated;
GRANT ALL ON public.fit_sessions TO service_role;
ALTER TABLE public.fit_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fit_sessions" ON public.fit_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at triggers
CREATE TRIGGER trg_lang_profile_updated BEFORE UPDATE ON public.lang_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_skin_profile_updated BEFORE UPDATE ON public.skin_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_skin_routines_updated BEFORE UPDATE ON public.skin_routines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fin_budgets_updated BEFORE UPDATE ON public.fin_budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fin_goals_updated BEFORE UPDATE ON public.fin_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fit_profile_updated BEFORE UPDATE ON public.fit_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Extend signup grants to all suite apps
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
  VALUES
    (NEW.id, 'saboria', 'active'),
    (NEW.id, 'socialia', 'active'),
    (NEW.id, 'petia', 'active'),
    (NEW.id, 'fluencyia', 'active'),
    (NEW.id, 'glowia', 'active'),
    (NEW.id, 'granaia', 'active'),
    (NEW.id, 'fitia', 'active')
  ON CONFLICT (user_id, app_slug) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Backfill entitlements for existing users
INSERT INTO public.app_entitlements (user_id, app_slug, status)
SELECT u.id, s.slug, 'active'
FROM auth.users u
CROSS JOIN (VALUES ('fluencyia'),('glowia'),('granaia'),('fitia')) AS s(slug)
ON CONFLICT (user_id, app_slug) DO NOTHING;
