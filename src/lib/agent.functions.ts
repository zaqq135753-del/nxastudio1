import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL, recallContext, rememberFact } from "./ai-shared";

type SB = { rpc: (...a: unknown[]) => Promise<{ data: unknown; error: unknown }>; from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> } };

export type BriefingItem = { app: string; title: string; reason: string; action: string; route: string };
export type Briefing = { headline: string; greeting: string; items: BriefingItem[]; generatedAt: string };

export const ROUTES: Record<string, string> = {
  saboria: "/apps/saboria",
  fitia: "/apps/fitia",
  granaia: "/apps/granaia",
  glowia: "/apps/glowia",
  fluencyia: "/apps/fluencyia",
  socialia: "/apps/socialia",
  petia: "/apps/petia",
  styleia: "/apps/styleia",
  cosmosia: "/apps/cosmosia",
  roteiroia: "/apps/roteiroia",
};

type SupabaseLike = Parameters<typeof recallContext>[0];

/** Núcleo compartilhado (usado tanto pelo endpoint autenticado quanto pelo cron). */
export async function buildBriefingFor(
  supabase: SupabaseLike,
  userId: string,
): Promise<Briefing> {
  const sb = supabase as unknown as SB;
  const { data } = await sb.rpc("match_user_memories", {
    _user_id: userId,
    _query_embedding: new Array(1536).fill(0),
    _app_slugs: null,
    _match_count: 30,
  });
  const memRows = (data as Array<{ app_slug: string; kind: string; content: string }> | null) ?? [];
  const memoryBlock = memRows.length
    ? memRows.slice(0, 20).map((r) => `[${r.app_slug}/${r.kind}] ${r.content}`).join("\n")
    : "(sem histórico ainda)";

  const now = new Date();
  const hour = now.getHours();
  const period = hour < 5 ? "madrugada" : hour < 12 ? "manhã" : hour < 18 ? "tarde" : "noite";
  const cross = await recallContext(supabase, userId, "cross", `sugestões para ${period}`);

  const system = `Você é o **NXA Concierge** de uma suíte de 10 apps (NXA Chef, NXA Fit, NXA Money, NXA Glow, NXA Lingua, NXA Social, NXA Pet, NXA Style, NXA Estudantil, NXA Travel).
Analise o histórico e proponha 3 ações proativas e cruzadas para AGORA (${period}, ${hour}h).
Slugs válidos: saboria, fitia, granaia, glowia, fluencyia, socialia, petia, styleia, cosmosia, roteiroia.
Responda APENAS JSON: {"headline":"...","greeting":"...","items":[{"app":"slug","title":"...","reason":"...","action":"..."}]}`;

  const raw = await callGateway({
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Memórias recentes:\n${memoryBlock}\n\n${cross}\n\nGere agora.` },
    ],
    temperature: 0.7,
    max_tokens: 900,
    response_format: { type: "json_object" },
  });

  const parsed = parseJson<{ headline: string; greeting: string; items: Omit<BriefingItem, "route">[] }>(raw);
  const items: BriefingItem[] = (parsed.items ?? []).slice(0, 3).map((i) => ({
    ...i,
    app: i.app in ROUTES ? i.app : "saboria",
    route: ROUTES[i.app] ?? "/hub",
  }));

  rememberFact(supabase, userId, "cross", "briefing", `Sugeriu: ${items.map((i) => i.title).join(" | ")}`);

  return { headline: parsed.headline ?? "Seu dia, com IA", greeting: parsed.greeting ?? "", items, generatedAt: now.toISOString() };
}

/** Endpoint autenticado, usado pelo BriefingCard. */
export const dailyBriefing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => buildBriefingFor(context.supabase, context.userId));

/** Lista as notificações do usuário. */
export const listNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("id, kind, app_slug, title, body, route, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; all?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const q = context.supabase.from("notifications").update({ read_at: new Date().toISOString() });
    const { error } = data.all
      ? await q.is("read_at", null)
      : await q.eq("id", data.id ?? "");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
