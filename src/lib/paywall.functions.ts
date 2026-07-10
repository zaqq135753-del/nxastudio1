import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type PlanStatus = {
  plan: "trial" | "pro_3" | "pro_all" | "expired";
  trial_ends_at: string | null;
  days_left: number;
  active_apps: string[];
};

export const getMyPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlanStatus> => {
    const { data } = await context.supabase
      .from("app_entitlements").select("app_slug,status,plan,trial_ends_at")
      .eq("user_id", context.userId);
    const rows = data ?? [];
    const active_apps = rows.filter(r => r.status === "active").map(r => r.app_slug);
    const plan = (rows[0]?.plan as PlanStatus["plan"]) ?? "trial";
    const trial_ends_at = (rows[0]?.trial_ends_at as string | null) ?? null;
    const days_left = trial_ends_at
      ? Math.max(0, Math.ceil((new Date(trial_ends_at).getTime() - Date.now()) / 86400000))
      : 0;
    return { plan, trial_ends_at, days_left, active_apps };
  });

export const selectPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    plan: z.enum(["pro_3", "pro_all"]),
    apps: z.array(z.string()).optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // NOTE: real payment flow will be wired via Stripe/Paddle. This just marks intent.
    await supabase.from("app_entitlements").update({
      plan: data.plan,
      trial_ends_at: null,
    }).eq("user_id", userId);
    return { ok: true };
  });
