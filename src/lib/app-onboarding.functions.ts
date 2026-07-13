import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SaveSchema = z.object({
  appSlug: z.string().min(1),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

/** Salva as respostas do onboarding de um app específico (upsert por user+app). */
export const saveAppOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("app_onboarding")
      .upsert(
        {
          user_id: context.userId,
          app_slug: data.appSlug,
          answers: data.answers,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,app_slug" }
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Verifica se o usuário já completou onboarding do app. */
export const hasAppOnboarded = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ appSlug: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { count } = await context.supabase
      .from("app_onboarding")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .eq("app_slug", data.appSlug);
    return { onboarded: (count ?? 0) > 0 };
  });
