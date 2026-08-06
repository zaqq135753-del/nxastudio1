-- 1) Affiliates: remove anonymous full-table read
DROP POLICY IF EXISTS "public code lookup" ON public.affiliates;
REVOKE ALL ON public.affiliates FROM anon;

-- 2) Platform settings: admin-only reads
DROP POLICY IF EXISTS "Anyone can read platform settings" ON public.platform_settings;
REVOKE ALL ON public.platform_settings FROM anon;
CREATE POLICY "Admins can read platform settings"
  ON public.platform_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) SECURITY DEFINER functions: revoke direct EXECUTE where not needed
REVOKE ALL ON FUNCTION public.grant_admin_for_owner_email() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.feed_likes_count_trg() FROM PUBLIC, anon, authenticated;

-- claim_trial must stay callable by signed-in users only
REVOKE ALL ON FUNCTION public.claim_trial(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_trial(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_trial(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_trial(text, text) TO authenticated;

-- has_role is used inside policies for signed-in users only
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;