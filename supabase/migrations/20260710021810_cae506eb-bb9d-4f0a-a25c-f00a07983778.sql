
-- StyleIA
CREATE TABLE public.style_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  body_type TEXT, style_words TEXT[], colors_favorite TEXT[], colors_avoid TEXT[],
  occasions TEXT[], budget TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.style_profile TO authenticated;
GRANT ALL ON public.style_profile TO service_role;
ALTER TABLE public.style_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own style_profile" ON public.style_profile FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.style_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT, season TEXT, image_url TEXT,
  tags TEXT[], times_worn INT NOT NULL DEFAULT 0,
  last_worn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.style_items TO authenticated;
GRANT ALL ON public.style_items TO service_role;
ALTER TABLE public.style_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own style_items" ON public.style_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.style_looks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occasion TEXT,
  item_ids UUID[] NOT NULL DEFAULT '{}',
  description TEXT, image_url TEXT,
  worn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.style_looks TO authenticated;
GRANT ALL ON public.style_looks TO service_role;
ALTER TABLE public.style_looks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own style_looks" ON public.style_looks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CosmosIA
CREATE TABLE public.cosmos_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE, birth_time TIME, birth_place TEXT,
  sun_sign TEXT, moon_sign TEXT, rising_sign TEXT,
  chart JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cosmos_profile TO authenticated;
GRANT ALL ON public.cosmos_profile TO service_role;
ALTER TABLE public.cosmos_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cosmos_profile" ON public.cosmos_profile FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.cosmos_tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT,
  spread TEXT NOT NULL DEFAULT 'three',
  cards JSONB NOT NULL,
  interpretation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cosmos_tarot_readings TO authenticated;
GRANT ALL ON public.cosmos_tarot_readings TO service_role;
ALTER TABLE public.cosmos_tarot_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tarot" ON public.cosmos_tarot_readings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.cosmos_horoscopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  for_date DATE NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, for_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cosmos_horoscopes TO authenticated;
GRANT ALL ON public.cosmos_horoscopes TO service_role;
ALTER TABLE public.cosmos_horoscopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own horoscopes" ON public.cosmos_horoscopes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RoteiroIA
CREATE TABLE public.travel_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  start_date DATE, end_date DATE,
  travelers INT NOT NULL DEFAULT 1,
  budget_brl NUMERIC(10,2),
  style TEXT,
  interests TEXT[],
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  budget_breakdown JSONB,
  status TEXT NOT NULL DEFAULT 'planned',
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.travel_itineraries TO authenticated;
GRANT ALL ON public.travel_itineraries TO service_role;
ALTER TABLE public.travel_itineraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own itineraries" ON public.travel_itineraries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at triggers
CREATE TRIGGER t_style_profile_upd BEFORE UPDATE ON public.style_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_style_items_upd BEFORE UPDATE ON public.style_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_style_looks_upd BEFORE UPDATE ON public.style_looks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_cosmos_profile_upd BEFORE UPDATE ON public.cosmos_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_travel_itineraries_upd BEFORE UPDATE ON public.travel_itineraries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Entitlements: novos apps no signup + backfill
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.app_entitlements (user_id, app_slug, status)
  VALUES
    (NEW.id, 'saboria', 'active'),
    (NEW.id, 'socialia', 'active'),
    (NEW.id, 'petia', 'active'),
    (NEW.id, 'fluencyia', 'active'),
    (NEW.id, 'glowia', 'active'),
    (NEW.id, 'granaia', 'active'),
    (NEW.id, 'fitia', 'active'),
    (NEW.id, 'styleia', 'active'),
    (NEW.id, 'cosmosia', 'active'),
    (NEW.id, 'roteiroia', 'active')
  ON CONFLICT (user_id, app_slug) DO NOTHING;

  RETURN NEW;
END;
$$;

INSERT INTO public.app_entitlements (user_id, app_slug, status)
SELECT u.id, s.slug, 'active'
FROM auth.users u
CROSS JOIN (VALUES ('styleia'), ('cosmosia'), ('roteiroia')) AS s(slug)
ON CONFLICT (user_id, app_slug) DO NOTHING;
