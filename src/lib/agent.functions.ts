import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL, recallContext, rememberFact } from "./ai-shared";

type SB = { rpc: (...a: unknown[]) => Promise<{ data: unknown; error: unknown }> };

export type BriefingItem = {
  app: string;      // slug (saboria, fitia, ...)
  title: string;    // ex.: "Repita o treino de pernas"
  reason: string;   // por que agora
  action: string;   // CTA curto
  route: string;    // caminho interno sugerido
};

export type Briefing = {
  headline: string;
  greeting: string;
  items: BriefingItem[];
  generatedAt: string;
};

const ROUTES: Record<string, string> = {
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

/**
 * Agente proativo: combina memórias de todos os apps + hora do dia e devolve
 * 3 sugestões prioritárias e cruzadas (ex.: "receita rápida antes do treino").
 */
export const dailyBriefing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Busca as memórias mais recentes de qualquer app (todos os slugs + cross).
    const sb = supabase as unknown as SB;
    const { data } = await sb.rpc("match_user_memories", {
      _user_id: userId,
      _query_embedding: new Array(1536).fill(0), // qualquer vetor: sem filtro semântico, ordena por proximidade a zero
      _app_slugs: null,
      _match_count: 30,
    });
    const memRows = (data as Array<{ app_slug: string; kind: string; content: string; created_at: string }> | null) ?? [];
    const memoryBlock = memRows.length
      ? memRows.slice(0, 20).map((r) => `[${r.app_slug}/${r.kind}] ${r.content}`).join("\n")
      : "(sem histórico ainda)";

    // Reforça com recall semântico direcionado ao "estado atual".
    const now = new Date();
    const hour = now.getHours();
    const period = hour < 5 ? "madrugada" : hour < 12 ? "manhã" : hour < 18 ? "tarde" : "noite";
    const cross = await recallContext(supabase, userId, "cross", `sugestões para ${period}`);

    const system = `Você é o **Concierge IA** de uma suíte de 10 apps (SaborIA, FitIA, GranaIA, GlowIA, FluencyIA, SocialIA, PetIA, StyleIA, CosmosIA, RoteiroIA).
Analise o histórico do usuário e proponha 3 ações **proativas, cruzadas entre apps** para AGORA (${period}, ${hour}h).
Cada item deve ter um motivo real ligado ao histórico (não invente). Se não houver dados, sugira onboardings rápidos.
Slugs válidos: saboria, fitia, granaia, glowia, fluencyia, socialia, petia, styleia, cosmosia, roteiroia.
Responda APENAS JSON:
{"headline":"frase curta e pessoal","greeting":"1 linha calorosa","items":[{"app":"slug","title":"...","reason":"...","action":"CTA curto"}]}`;

    const user = `Memórias recentes:\n${memoryBlock}\n\n${cross}\n\nGere agora.`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
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

    // memoriza o briefing como contexto cruzado
    rememberFact(supabase, userId, "cross", "briefing", `Sugeriu: ${items.map((i) => i.title).join(" | ")}`);

    return {
      headline: parsed.headline ?? "Seu dia, com IA",
      greeting: parsed.greeting ?? "",
      items,
      generatedAt: now.toISOString(),
    } satisfies Briefing;
  });
