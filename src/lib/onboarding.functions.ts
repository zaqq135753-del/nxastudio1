import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SaveSchema = z.object({
  answers: z.array(z.object({ question: z.string(), answer: z.string().min(1) })).min(1),
});

/** Salva respostas do onboarding como memórias cross-app (appSlug=global). */
export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { embed } = await import("./memory.server");
    const rows = await Promise.all(
      data.answers.map(async (a) => ({
        user_id: context.userId,
        app_slug: "global",
        kind: "onboarding",
        content: `${a.question} → ${a.answer}`,
        embedding: (await embed(`${a.question} ${a.answer}`)) as unknown as string | null,
        metadata: { question: a.question },
      }))
    );
    const { error } = await context.supabase.from("user_memories").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true, saved: rows.length };
  });

/** Retorna true se o usuário já concluiu o onboarding. */
export const hasOnboarded = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count, error } = await context.supabase
      .from("user_memories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .eq("kind", "onboarding");
    if (error) return { onboarded: false };
    return { onboarded: (count ?? 0) > 0 };
  });
