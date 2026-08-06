import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

function makeCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export type AffiliateStats = {
  code: string;
  clicks: number;
  signups: number;
  paid_conversions: number;
  referrals: { referred_user_id: string; status: string; created_at: string }[];
  commission_estimate_brl: number;
};

export const getMyAffiliate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AffiliateStats> => {
    const { supabase, userId } = context;
    let { data: aff } = await supabase
      .from("affiliates").select("*").eq("user_id", userId).maybeSingle();

    if (!aff) {
      // generate unique code
      for (let i = 0; i < 5; i++) {
        const code = makeCode();
        const { data, error } = await supabase.from("affiliates")
          .insert({ user_id: userId, code }).select("*").single();
        if (!error) { aff = data; break; }
      }
    }
    if (!aff) throw new Error("Não foi possível criar código de afiliado");

    const { data: refs } = await supabase
      .from("affiliate_referrals")
      .select("referred_user_id,status,created_at")
      .eq("affiliate_user_id", userId)
      .order("created_at", { ascending: false });

    const paid = aff.paid_conversions ?? 0;
    return {
      code: aff.code,
      clicks: aff.clicks ?? 0,
      signups: aff.signups ?? 0,
      paid_conversions: paid,
      referrals: refs ?? [],
      commission_estimate_brl: paid * 15, // 30% de ~R$49 estimado
    };
  });

export const registerReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ code: z.string().min(4).max(12) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const code = data.code.toUpperCase();

    const { data: existing } = await supabase
      .from("affiliate_referrals").select("id").eq("referred_user_id", userId).maybeSingle();
    if (existing) return { ok: false, reason: "already_referred" };

    // Code -> owner resolution runs server-side with elevated privileges so that
    // affiliate rows never need to be readable by other (or anonymous) users.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: aff } = await supabaseAdmin
      .from("affiliates").select("user_id").eq("code", code).maybeSingle();
    if (!aff) return { ok: false, reason: "invalid_code" };
    if (aff.user_id === userId) return { ok: false, reason: "self" };

    await supabase.from("affiliate_referrals").insert({
      affiliate_user_id: aff.user_id,
      referred_user_id: userId,
      code,
      status: "signed_up",
    });

    // best-effort counter bump
    const { data: cur } = await supabaseAdmin
      .from("affiliates").select("signups").eq("user_id", aff.user_id).maybeSingle();
    await supabaseAdmin.from("affiliates")
      .update({ signups: (cur?.signups ?? 0) + 1 })
      .eq("user_id", aff.user_id);

    return { ok: true };
  });
