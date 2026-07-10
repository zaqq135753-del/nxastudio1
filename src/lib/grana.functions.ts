import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL, recallContext, rememberFact, type ChatMessage } from "./ai-shared";

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

    const mem = await recallContext(context.supabase, context.userId, "granaia", data.message);
    const system = `Você é um consultor financeiro brasileiro. Analise os dados reais do usuário. Seja prático, empático e específico. Máximo 200 palavras. Use R$.
Últimas transações: ${JSON.stringify(tx ?? [])}${mem ? "\n\n" + mem : ""}`;
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        ...data.history.slice(-8),
        { role: "user", content: data.message },
      ],
      temperature: 0.6, max_tokens: 800,
    });
    rememberFact(context.supabase, context.userId, "granaia", "consulta", `Pergunta financeira: ${data.message.slice(0, 200)}`);
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

// ============ HERO: "Posso comprar?" ============
export type PurchaseAdvice = {
  verdict: "sim" | "pode" | "espere" | "nao";
  headline: string;
  reasoning: string[];
  impact: { on_month: string; on_goals: string };
  alternatives: string[];
};

export const canIBuy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { item: string; amount: number; urgency?: "baixa"|"media"|"alta" }) => d)
  .handler(async ({ data, context }): Promise<PurchaseAdvice> => {
    const [{ data: tx }, { data: goals }, { data: budgets }] = await Promise.all([
      context.supabase.from("fin_transactions").select("kind,category,amount,occurred_on").eq("user_id", context.userId).order("occurred_on",{ascending:false}).limit(80),
      context.supabase.from("fin_goals").select("*").eq("user_id", context.userId),
      context.supabase.from("fin_budgets").select("*").eq("user_id", context.userId),
    ]);
    const mem = await recallContext(context.supabase, context.userId, "granaia", `comprar ${data.item} R$${data.amount}`);
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Consultor financeiro pessoal, direto e honesto. Analise se a compra faz sentido AGORA considerando fluxo real, metas e orçamentos. Verdict deve ser "sim" | "pode" | "espere" | "nao". Responda APENAS JSON: {"verdict":"...","headline":"frase curta e clara","reasoning":["motivo 1","motivo 2","motivo 3"],"impact":{"on_month":"...","on_goals":"..."},"alternatives":["opção mais barata","adiar 30d","etc"]}${mem ? "\n\n" + mem : ""}` },
        { role: "user", content: `Compra: ${data.item} — R$ ${data.amount.toFixed(2)} (urgência: ${data.urgency ?? "media"}).\nTransações recentes: ${JSON.stringify(tx?.slice(0,40) ?? [])}.\nMetas: ${JSON.stringify(goals ?? [])}.\nOrçamentos: ${JSON.stringify(budgets ?? [])}.` },
      ],
      temperature: 0.4,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });
    const parsed = parseJson<PurchaseAdvice>(raw);
    rememberFact(context.supabase, context.userId, "granaia", "compra", `Consultou "${data.item}" R$${data.amount.toFixed(2)} → veredito: ${parsed.verdict}. ${parsed.headline}`);
    return parsed;
  });

/* =============== Receipt OCR — foto de comprovante → transações =============== */
export type ScannedReceipt = {
  merchant: string | null;
  date: string | null;
  total: number | null;
  items: Array<{ description: string; amount: number; category: string }>;
};

export const scanReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { imageBase64: string }) => {
    if (!d?.imageBase64?.startsWith("data:image/")) throw new Error("Imagem inválida");
    return d;
  })
  .handler(async ({ data }): Promise<ScannedReceipt> => {
    const raw = await callGateway({
      model: "openai/gpt-5", max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `Você extrai dados de comprovantes/notas fiscais brasileiros.
Retorne APENAS JSON válido:
{"merchant":"Nome do estabelecimento","date":"YYYY-MM-DD","total":123.45,"items":[{"description":"item","amount":12.34,"category":"alimentação"}]}
Categorias: alimentação, transporte, moradia, lazer, saúde, educação, assinaturas, outros.
Se não conseguir ler: {"merchant":null,"date":null,"total":null,"items":[]}` },
        { role: "user", content: [
          { type: "text", text: "Extraia os dados desta nota." },
          { type: "image_url", image_url: { url: data.imageBase64 } },
        ] as unknown as string },
      ],
    });
    return parseJson<ScannedReceipt>(raw);
  });

export const importReceiptItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { items: Array<{ description: string; amount: number; category: string }>; date?: string }) => d)
  .handler(async ({ data, context }) => {
    const rows = data.items.map(it => ({
      user_id: context.userId, kind: "expense" as const,
      category: it.category, amount: it.amount, description: it.description,
      occurred_on: data.date ?? new Date().toISOString().slice(0, 10),
    }));
    const { error } = await context.supabase.from("fin_transactions").insert(rows);
    if (error) throw error;
    return { ok: true, count: rows.length };
  });
