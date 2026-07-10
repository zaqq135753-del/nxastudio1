import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL, recallContext, rememberFact } from "./ai-shared";

export type SkinDiagnosis = {
  summary: string;
  concerns: string[];
  recommendations: { step: string; why: string }[];
  ingredientsToUse: string[];
  ingredientsToAvoid: string[];
};

export type SkinRoutine = {
  period: "AM" | "PM";
  steps: { order: number; step: string; type: string; note: string }[];
};

export const getSkinProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("skin_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    return data;
  });

export const upsertSkinProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { skin_type?: string; concerns?: string[]; allergies?: string[]; age?: number; climate?: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: saved, error } = await context.supabase.from("skin_profile")
      .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id" })
      .select().maybeSingle();
    if (error) throw error;
    return saved;
  });

export const analyzeSkin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { imageBase64?: string; symptoms: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase.from("skin_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();

    const content: Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: `Perfil: ${JSON.stringify(profile ?? {})}\nSintomas/relato: ${data.symptoms}\n\nAnalise a pele e responda APENAS em JSON: {"summary":"...","concerns":["..."],"recommendations":[{"step":"...","why":"..."}],"ingredientsToUse":["..."],"ingredientsToAvoid":["..."]}` },
    ];
    if (data.imageBase64) content.push({ type: "image_url", image_url: { url: data.imageBase64 } });

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: "Você é uma dermatologista brasileira. Nunca diagnostique doenças graves com certeza; recomende consulta presencial quando necessário." },
        { role: "user", content: content as unknown as string },
      ],
      temperature: 0.5, max_tokens: 2000,
    });
    const parsed = parseJson<SkinDiagnosis>(raw);
    await context.supabase.from("skin_analyses").insert({
      user_id: context.userId, diagnosis: parsed,
    });
    return parsed;
  });

export const generateRoutine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { period: "AM" | "PM" }) => d)
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase.from("skin_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Crie uma rotina de skincare ${data.period === "AM" ? "matinal" : "noturna"} personalizada em pt-BR. Responda APENAS em JSON: {"period":"${data.period}","steps":[{"order":1,"step":"Limpeza","type":"limpeza","note":"por que"}]}` },
        { role: "user", content: `Perfil: ${JSON.stringify(profile ?? {})}` },
      ],
      temperature: 0.6, max_tokens: 1200,
    });
    const parsed = parseJson<SkinRoutine>(raw);
    await context.supabase.from("skin_routines").insert({
      user_id: context.userId, period: data.period, steps: parsed.steps,
    });
    return parsed;
  });

export const listRoutines = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("skin_routines")
      .select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(4);
    return data ?? [];
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("skin_analyses")
      .select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(10);
    return data ?? [];
  });

// ============ HERO: "Rotina de hoje" contextual ============
export type TodayRoutine = {
  period: "AM" | "PM";
  context_tip: string;
  steps: { order: number; step: string; product: string; why: string; time_sec: number }[];
  warning?: string;
};

export const todayRoutine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { period: "AM"|"PM"; weather?: string; feeling?: string; uv_index?: number }) => d)
  .handler(async ({ data, context }): Promise<TodayRoutine> => {
    const { data: profile } = await context.supabase.from("skin_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Dermato-consultora brasileira. Monte a rotina de HOJE (${data.period}) adaptada ao clima, UV e como a pele está agora. Cite ativos, não marcas. Se houver conflito de ativos, use warning. Responda APENAS JSON: {"period":"AM|PM","context_tip":"tip curta e prática","steps":[{"order":1,"step":"...","product":"tipo de produto","why":"...","time_sec":30}],"warning":"opcional"}` },
        { role: "user", content: `Perfil: ${JSON.stringify(profile) || "não preenchido"}.\nHoje: clima ${data.weather ?? "n/a"}, UV ${data.uv_index ?? "n/a"}, pele: ${data.feeling ?? "normal"}.` },
      ],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });
    return parseJson<TodayRoutine>(raw);
  });
