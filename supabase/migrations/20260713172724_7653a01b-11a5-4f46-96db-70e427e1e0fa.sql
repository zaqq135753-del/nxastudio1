
CREATE TABLE public.app_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_slug TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, app_slug)
);
CREATE INDEX idx_app_onboarding_user ON public.app_onboarding(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_onboarding TO authenticated;
GRANT ALL ON public.app_onboarding TO service_role;
ALTER TABLE public.app_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_onboarding" ON public.app_onboarding FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_app_onboarding_updated_at
  BEFORE UPDATE ON public.app_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
