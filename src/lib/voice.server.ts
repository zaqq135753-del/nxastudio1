import { callGateway, TEXT_MODEL } from "./ai-shared";

/**
 * Agente de Orquestração Global (Onda II)
 * Este helper processa comandos de voz ou texto e decide o que fazer na Suite.
 */
export async function processGlobalCommand(input: string, userId: string, supabaseAdmin: any) {
  // 1. Buscar contexto do usuário (preferências, apps ativos)
  const { data: ents } = await supabaseAdmin
    .from("app_entitlements")
    .select("app_slug, tier")
    .eq("user_id", userId)
    .eq("status", "active");

  const appsList = ents?.map((e: any) => `${e.app_slug} (${e.tier})`).join(", ") || "Nenhum app ativo";

  const system = `Você é o Agente Global da NXA Studio. Sua missão é coordenar os 10 apps da suíte.
Apps disponíveis: saboria (chef), fitia (personal), granaia (financeiro), glowia (skincare), petia (vet), socialia (marketing), fluencyia (idiomas), styleia (estilo), cosmosia (astrologia), roteiroia (viagens).

Usuário tem ativos: ${appsList}

Responda em JSON:
{
  "reply": "Resposta curta e elegante em pt-BR",
  "action": "ADD_EXPENSE | GENERATE_RECIPE | CREATE_POST | etc",
  "targetApp": "slug do app",
  "data": { "valor": 50, "categoria": "alimentacao" }
}

Se for uma dúvida geral sobre a plataforma ou algo não coberto por apps específicos, responda como NXA Concierge.`;

  const raw = await callGateway({
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: input }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  return JSON.parse(raw);
}
