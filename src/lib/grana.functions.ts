import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL, type ChatMessage } from "./ai-shared";

export type FinancialInsight = {
  summary: string;
  alerts: string[];
  savings: string[];
  nextSteps: string[];
};

export const addTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: "income" | "expense"; category: string; amount: number; description?: string; occurred_on?: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("fin_transactions").insert({
      user_id: context.userId, ...data,
    });
    if (error) throw error;
    return { ok: true };
  });

export const listTransactions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { limit?: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase.from("fin_transactions")
      .select("*").eq("user_id", context.userId)
      .order("occurred_on", { ascending: false }).limit(data.limit ?? 100);
    return rows ?? [];
  });

export const deleteTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("fin_transactions").delete()
      .eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });

export const financialSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const start = new Date(); start.setDate(1);
    const { data } = await context.supabase.from("fin_transactions")
      .select("kind, category, amount, occurred_on")
      .eq("user_id", context.userId)
      .gte("occurred_on", start.toISOString().slice(0, 10));
    const income = (data ?? []).filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = (data ?? []).filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const byCategory: Record<string, number> = {};
    for (const t of data ?? []) {
      if (t.kind === "expense") byCategory[t.category] = (byCategory[t.category] ?? 0) + Number(t.amount);
    }
    return { income, expense, balance: income - expense, byCategory, count: (data ?? []).length };
  });

export const financialChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { message: string; history: ChatMessage[] }) => d)
  .handler(async ({ data, context }) => {
    const start = new Date(); start.setMonth(start.getMonth() - 1);
    const { data: tx } = await context.supabase.from("fin_transactions")
      .select("kind, category, amount, description, occurred_on")
      .eq("user_id", context.userId)
      .gte("occurred_on", start.toISOString().slice(0, 10))
      .order("occurred_on", { ascending: false }).limit(80);

    const system = `Você é um consultor financeiro brasileiro. Analise os dados reais do usuário. Seja prático, empático e específico. Máximo 200 palavras. Use R$.
Últimas transações: ${JSON.stringify(tx ?? [])}`;
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        ...data.history.slice(-8),
        { role: "user", content: data.message },
      ],
      temperature: 0.6, max_tokens: 800,
    });
    return { reply: raw };
  });

export const financialInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const start = new Date(); start.setMonth(start.getMonth() - 1);
    const { data: tx } = await context.supabase.from("fin_transactions")
      .select("kind, category, amount, occurred_on")
      .eq("user_id", context.userId)
      .gte("occurred_on", start.toISOString().slice(0, 10));
    if (!tx?.length) return { summary: "Ainda não há transações suficientes para análise.", alerts: [], savings: [], nextSteps: ["Adicione suas primeiras transações."] };
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Analise os dados financeiros e gere insights em pt-BR. Responda APENAS em JSON: {"summary":"...","alerts":["..."],"savings":["..."],"nextSteps":["..."]}` },
        { role: "user", content: JSON.stringify(tx) },
      ],
      temperature: 0.5, max_tokens: 1200,
    });
    return parseJson<FinancialInsight>(raw);
  });

export const upsertGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; title: string; target_amount: number; saved_amount?: number; deadline?: string }) => d)
  .handler(async ({ data, context }) => {
    const payload = { ...data, user_id: context.userId };
    const { data: saved, error } = data.id
      ? await context.supabase.from("fin_goals").update(payload).eq("id", data.id).eq("user_id", context.userId).select().maybeSingle()
      : await context.supabase.from("fin_goals").insert(payload).select().maybeSingle();
    if (error) throw error;
    return saved;
  });

export const listGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("fin_goals")
      .select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("fin_goals").delete().eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });
