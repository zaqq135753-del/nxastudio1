
CREATE TABLE public.affiliates (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  clicks INTEGER NOT NULL DEFAULT 0,
  signups INTEGER NOT NULL DEFAULT 0,
  paid_conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.affiliates TO authenticated;
GRANT SELECT ON public.affiliates TO anon;
GRANT ALL ON public.affiliates TO service_role;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own affiliate row read" ON public.affiliates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own affiliate row upsert" ON public.affiliates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own affiliate row update" ON public.affiliates FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "public code lookup" ON public.affiliates FOR SELECT TO anon USING (true);

CREATE TABLE public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'signed_up',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id)
);
GRANT SELECT, INSERT ON public.affiliate_referrals TO authenticated;
GRANT ALL ON public.affiliate_referrals TO service_role;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate sees own referrals" ON public.affiliate_referrals FOR SELECT TO authenticated USING (auth.uid() = affiliate_user_id);
CREATE POLICY "referred user sees own record" ON public.affiliate_referrals FOR SELECT TO authenticated USING (auth.uid() = referred_user_id);
CREATE POLICY "self insert referral" ON public.affiliate_referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referred_user_id);
