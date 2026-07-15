
-- Pricing overrides
CREATE TABLE public.app_pricing_overrides (
  app_slug TEXT PRIMARY KEY,
  base_monthly INTEGER,
  base_price_label TEXT,
  base_tagline TEXT,
  prime_monthly INTEGER,
  prime_price_label TEXT,
  prime_tagline TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT ON public.app_pricing_overrides TO anon, authenticated;
GRANT ALL ON public.app_pricing_overrides TO service_role;

ALTER TABLE public.app_pricing_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pricing overrides"
  ON public.app_pricing_overrides FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pricing overrides"
  ON public.app_pricing_overrides FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER app_pricing_overrides_updated_at
  BEFORE UPDATE ON public.app_pricing_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Platform settings (key/value)
CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT ALL ON public.platform_settings TO service_role;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage platform settings"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a few useful defaults
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('trial_days', '7'::jsonb, 'Duração do trial em dias'),
  ('announcement_banner', '{"enabled":false,"message":"","tone":"info"}'::jsonb, 'Banner de anúncio exibido no topo'),
  ('feature_flags', '{"voice_realtime":true,"agent_actions":true,"affiliates":true,"social_feed":true}'::jsonb, 'Ativa/desativa features globalmente'),
  ('ai_credits', '{"trial":30,"base":150,"prime":600}'::jsonb, 'Créditos de IA por tier'),
  ('support_email', '"suporte@nxa.app"'::jsonb, 'Email de suporte exibido no rodapé')
ON CONFLICT (key) DO NOTHING;
