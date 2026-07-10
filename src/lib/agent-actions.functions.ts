import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { callGateway, parseJson, TEXT_MODEL, recallContext, rememberFact, type ChatMessage } from "./ai-shared";

/** Ações que o Agente pode PROPOR. Execução exige confirmação do usuário. */
export type AgentAction =
  | { type: "add_expense"; category: string; amount: number; description?: string; occurred_on?: string }
  | { type: "add_income"; category: string; amount: number; description?: string; occurred_on?: string }
  | { type: "log_workout"; workout_id?: string; duration_min?: number; notes?: string }
  | { type: "add_pet_health"; pet_id: string; kind: string; description: string }
  | { type: "add_pet_meal"; pet_id: string; food: string; amount_g?: number }
  | { type: "navigate"; route: string; label: string };

export type AgentReply = {
  reply: string;
  actions: AgentAction[];
};

const APP_CONTEXT = `Apps NXA disponíveis (para propor navegação): 
- /apps/saboria (Chef — receitas, geladeira, planner)
- /apps/fitia (Fit — treinos, coach)
- /apps/granaia (Money — finanças, metas)
- /apps/glowia (Glow — skincare)
- /apps/petia (Pet — cuidados)
- /apps/socialia (Social — posts)
- /apps/fluencyia (Lingua — idiomas)
- /apps/styleia (Style — looks)
- /apps/cosmosia (Cosmos — astrologia)
- /apps/roteiroia (Travel — viagens)`;

/** Roda um turno do Agente: gera texto + lista de ações propostas (não executadas). */
export const agentTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { message: string; history: ChatMessage[] }) => d)
  .handler(async ({ data, context }) => {
    // contexto: memória semântica cross-app + pets + últimas transações
    const mem = await recallContext(context.supabase, context.userId, "cross", data.message);
    const [{ data: pets }, { data: tx }, { data: workouts }] = await Promise.all([
      context.supabase.from("pets").select("id,name,species").eq("user_id", context.userId).limit(6),
      context.supabase.from("fin_transactions").select("kind,category,amount,occurred_on").eq("user_id", context.userId).order("occurred_on", { ascending: false }).limit(10),
      context.supabase.from("fit_workouts").select("id,name,created_at").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(5),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const system = `Você é o **NXA Agente**, uma IA que age em nome do usuário através de aplicativos NXA.
Sua função: entender o pedido, responder em pt-BR (max 100 palavras, tom clean/direto) e propor AÇÕES ESTRUTURADAS que o usuário confirma antes de executar.

${APP_CONTEXT}

Ações possíveis (schema JSON):
- {"type":"add_expense","category":"string","amount":number,"description":"string?","occurred_on":"YYYY-MM-DD?"}
- {"type":"add_income","category":"string","amount":number,"description":"string?","occurred_on":"YYYY-MM-DD?"}
- {"type":"log_workout","workout_id":"uuid?","duration_min":number?,"notes":"string?"}
- {"type":"add_pet_health","pet_id":"uuid","kind":"peso|vacina|consulta|remedio|outro","description":"string"}
- {"type":"add_pet_meal","pet_id":"uuid","food":"string","amount_g":number?}
- {"type":"navigate","route":"/apps/...","label":"string curto"}

Regras:
- SÓ proponha uma ação se o usuário claramente pediu por ela.
- Para navegação genérica ("me leva no fit"), use "navigate".
- Nunca invente pet_id/workout_id — só use IDs do contexto abaixo.
- Se faltar informação (ex.: valor da despesa), pergunte ao invés de propor.

Contexto do usuário (hoje ${today}):
Pets: ${JSON.stringify(pets ?? [])}
Últimas transações: ${JSON.stringify(tx ?? [])}
Treinos disponíveis: ${JSON.stringify(workouts ?? [])}
${mem ? "\n" + mem : ""}

Responda SEMPRE JSON estrito:
{"reply":"...", "actions":[...]}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        ...data.history.slice(-8),
        { role: "user", content: data.message },
      ],
      max_tokens: 800,
      response_format: { type: "json_object" },
    });
    const parsed = parseJson<AgentReply>(raw);
    rememberFact(context.supabase, context.userId, "cross", "agent", `Pediu: ${data.message.slice(0, 200)}`);
    return {
      reply: parsed.reply ?? "",
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 5) : [],
    };
  });

const ActionSchema = z.object({
  action: z.any(),
}) as unknown as z.ZodType<{ action: AgentAction }>;

/** Executa UMA ação já confirmada pelo usuário. */
export const runAgentAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ActionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const a = data.action;
    const sb = context.supabase;
    const today = new Date().toISOString().slice(0, 10);
    switch (a.type) {
      case "add_expense":
      case "add_income": {
        const { error } = await sb.from("fin_transactions").insert({
          user_id: context.userId,
          kind: a.type === "add_expense" ? "expense" : "income",
          category: a.category,
          amount: a.amount,
          description: a.description ?? null,
          occurred_on: a.occurred_on ?? today,
        });
        if (error) throw new Error(error.message);
        return { ok: true, message: `${a.type === "add_expense" ? "Despesa" : "Receita"} de R$ ${a.amount.toFixed(2)} registrada.` };
      }
      case "log_workout": {
        const { error } = await sb.from("fit_sessions").insert({
          user_id: context.userId,
          workout_id: a.workout_id ?? null,
          duration_min: a.duration_min ?? 30,
          notes: a.notes ?? null,
        });
        if (error) throw new Error(error.message);
        return { ok: true, message: "Treino registrado." };
      }
      case "add_pet_health": {
        const { error } = await sb.from("pet_health_records").insert({
          user_id: context.userId, pet_id: a.pet_id, notes: `${a.kind}: ${a.description}`, record_date: today,
        });
        if (error) throw new Error(error.message);
        return { ok: true, message: "Registro de saúde adicionado." };
      }
      case "add_pet_meal": {
        const { error } = await sb.from("pet_meals").insert({
          user_id: context.userId, pet_id: a.pet_id, type: a.food, amount: a.amount_g ? `${a.amount_g}g` : null, meal_date: today,
        });
        if (error) throw new Error(error.message);
        return { ok: true, message: "Refeição registrada." };
      }
      case "navigate":
        return { ok: true, message: `Abrir ${a.label}`, route: a.route };
      default:
        throw new Error("Ação desconhecida");
    }
  });
