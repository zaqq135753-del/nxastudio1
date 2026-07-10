import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL, type ChatMessage } from "./ai-shared";

export const LANGS: Record<string, string> = {
  en: "Inglês", es: "Espanhol", fr: "Francês", it: "Italiano", de: "Alemão",
};

export type ConversationTurn = {
  reply: string;
  translation: string;
  correction: string | null;
  suggestion: string;
};

export type VocabItem = { term: string; translation: string; example: string };

export const getLangProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("lang_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    return data;
  });

export const upsertLangProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { target_lang: string; level: string; daily_goal_min: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: saved, error } = await context.supabase.from("lang_profile")
      .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id,target_lang" })
      .select().maybeSingle();
    if (error) throw error;
    return saved;
  });

export const conversationTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetLang: string; level: string; topic: string; history: ChatMessage[]; message: string }) => d)
  .handler(async ({ data, context }) => {
    const langName = LANGS[data.targetLang] ?? data.targetLang;
    const system = `Você é um tutor de ${langName} para brasileiros nível ${data.level}. Tópico: ${data.topic || "livre"}.
Regras:
- Responda em ${langName} (nível ${data.level}, use vocabulário adequado).
- Se o aluno cometer erro gramatical/vocabular, indique em "correction" com explicação em pt-BR.
- Sempre traduza sua resposta em "translation" (pt-BR).
- Em "suggestion" ofereça uma próxima frase em ${langName} que o aluno poderia dizer.
Responda APENAS em JSON: {"reply":"...","translation":"...","correction":"..." | null,"suggestion":"..."}`;
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        ...data.history.slice(-10),
        { role: "user", content: data.message },
      ],
      temperature: 0.7, max_tokens: 800,
    });
    const parsed = parseJson<ConversationTurn>(raw);
    await context.supabase.from("lang_sessions").insert({
      user_id: context.userId, target_lang: data.targetLang, kind: "conversation",
      duration_min: 1, payload: { message: data.message, reply: parsed },
    });
    return parsed;
  });

export const generateVocab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetLang: string; level: string; topic: string; count?: number }) => d)
  .handler(async ({ data, context }) => {
    const langName = LANGS[data.targetLang] ?? data.targetLang;
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Gere ${data.count ?? 8} palavras/expressões em ${langName} nível ${data.level} sobre "${data.topic}". Responda APENAS em JSON: {"items":[{"term":"...","translation":"pt-BR","example":"frase de exemplo em ${langName}"}]}` },
        { role: "user", content: data.topic },
      ],
      temperature: 0.7, max_tokens: 1500,
    });
    const parsed = parseJson<{ items: VocabItem[] }>(raw);
    if (parsed.items?.length) {
      await context.supabase.from("lang_vocabulary").insert(
        parsed.items.map((i) => ({
          user_id: context.userId, target_lang: data.targetLang,
          term: i.term, translation: i.translation, example: i.example,
        }))
      );
    }
    return parsed.items ?? [];
  });

export const listVocab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetLang: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase.from("lang_vocabulary")
      .select("*").eq("user_id", context.userId).eq("target_lang", data.targetLang)
      .order("created_at", { ascending: false }).limit(200);
    return rows ?? [];
  });

export const deleteVocab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("lang_vocabulary").delete()
      .eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });

export const langStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ count: vocab }, { count: sessions }] = await Promise.all([
      context.supabase.from("lang_vocabulary").select("id", { count: "exact", head: true }).eq("user_id", context.userId),
      context.supabase.from("lang_sessions").select("id", { count: "exact", head: true }).eq("user_id", context.userId),
    ]);
    return { vocab: vocab ?? 0, sessions: sessions ?? 0 };
  });
