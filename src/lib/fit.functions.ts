import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL, recallContext, rememberFact, type ChatMessage } from "./ai-shared";

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest_s: number;
  tips: string;
};
export type Workout = {
  title: string;
  focus: string;
  duration_min: number;
  difficulty: string;
  exercises: Exercise[];
  warmup: string[];
  cooldown: string[];
};

export const getFitProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("fit_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    return data;
  });

export const upsertFitProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { goal?: string; fitness_level?: string; equipment?: string[]; restrictions?: string; weight?: number; height?: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: saved, error } = await context.supabase.from("fit_profile")
      .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id" })
      .select().maybeSingle();
    if (error) throw error;
    return saved;
  });

export const generateWorkout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { focus?: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase.from("fit_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um personal trainer brasileiro. Crie UM treino completo baseado no perfil. Responda APENAS em JSON: {"title":"...","focus":"...","duration_min":45,"difficulty":"iniciante|intermediário|avançado","warmup":["..."],"exercises":[{"name":"...","sets":3,"reps":"12","rest_s":60,"tips":"..."}],"cooldown":["..."]}` },
        { role: "user", content: `Perfil: ${JSON.stringify(profile ?? {})}\nFoco solicitado: ${data.focus ?? "treino geral"}` },
      ],
      temperature: 0.6, max_tokens: 2000,
    });
    const parsed = parseJson<Workout>(raw);
    const { data: saved } = await context.supabase.from("fit_workouts").insert({
      user_id: context.userId,
      title: parsed.title, focus: parsed.focus,
      duration_min: parsed.duration_min, difficulty: parsed.difficulty,
      exercises: parsed as never,
    }).select().maybeSingle();
    return { workout: parsed, id: saved?.id };
  });

export const listWorkouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("fit_workouts")
      .select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(20);
    return data ?? [];
  });

export const completeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { workout_id?: string; duration_min: number; calories?: number; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("fit_sessions").insert({
      user_id: context.userId, ...data,
    });
    if (error) throw error;
    return { ok: true };
  });

export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("fit_sessions")
      .select("*").eq("user_id", context.userId)
      .order("completed_on", { ascending: false }).limit(60);
    return data ?? [];
  });

export const coachChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { message: string; history: ChatMessage[] }) => d)
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase.from("fit_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    const system = `Você é um personal trainer brasileiro motivador. Perfil do aluno: ${JSON.stringify(profile ?? {})}.
Regras: seja prático, cite exercícios reais, avise sobre segurança, no máximo 200 palavras.`;
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        ...data.history.slice(-8),
        { role: "user", content: data.message },
      ],
      temperature: 0.7, max_tokens: 800,
    });
    return { reply: raw };
  });

// ============ HERO: "Treino de hoje" adaptativo ============
export const todayWorkout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { energy: 1|2|3|4|5; time_min: number; location: "casa"|"academia"|"ar_livre"; pain?: string }) => d)
  .handler(async ({ data, context }): Promise<Workout> => {
    const { data: profile } = await context.supabase.from("fit_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Personal trainer brasileiro. Monte UM treino adaptado ao contexto de HOJE (energia, tempo, local, dor). Se houver dor, substitua exercícios que agravem. Responda APENAS JSON: {"title":"...","focus":"...","duration_min":30,"difficulty":"...","warmup":["..."],"exercises":[{"name":"...","sets":3,"reps":"12","rest_s":45,"tips":"..."}],"cooldown":["..."]}` },
        { role: "user", content: `Perfil: ${JSON.stringify(profile) || "iniciante"}. Hoje: energia ${data.energy}/5, ${data.time_min} min, local: ${data.location}${data.pain ? `, dor/limitação: ${data.pain}` : ""}.` },
      ],
      temperature: 0.6,
      max_tokens: 2500,
    });
    return parseJson<Workout>(raw);
  });
