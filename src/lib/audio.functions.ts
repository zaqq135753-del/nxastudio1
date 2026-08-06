import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AudioAnalysis } from "./estudantil.functions";

const TABLE = "studyia_audio_history";

export type AudioHistoryItem = {
  id: string;
  topic: string;
  transcript: string;
  score: number;
  date: string;
  accuratePoints: string[];
  missingConcepts: string[];
  aiAdvice: string;
};

export const getAudioHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AudioHistoryItem[]> => {
    const { data, error } = await (context.supabase as any)
      .from(TABLE)
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    // Histórico é opcional: nunca quebra a tela do usuário.
    if (error || !data) return [];

    return (data as any[]).map((item) => ({
      id: item.id,
      topic: item.topic,
      transcript: item.transcript,
      score: item.score,
      date: new Date(item.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      accuratePoints: (item.accurate_points ?? []) as string[],
      missingConcepts: (item.missing_concepts ?? []) as string[],
      aiAdvice: item.ai_advice,
    }));
  });

export const saveAudioAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { topic: string; transcript: string; analysis: AudioAnalysis }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any).from(TABLE).insert({
      user_id: context.userId,
      topic: data.topic,
      transcript: data.transcript,
      score: data.analysis.score,
      accurate_points: data.analysis.accuratePoints,
      missing_concepts: data.analysis.missingConcepts,
      ai_advice: data.analysis.aiAdvice,
    });

    if (error) return false;
    return true;
  });

export const clearAudioHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await (context.supabase as any)
      .from(TABLE)
      .delete()
      .eq("user_id", context.userId);

    if (error) return false;
    return true;
  });
