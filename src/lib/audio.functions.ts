import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client.server";
import { AudioAnalysis } from "./estudantil.functions";

export const getAudioHistory = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from("studyia_audio_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    return data.map((item: any) => ({
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
      accuratePoints: item.accurate_points as string[],
      missingConcepts: item.missing_concepts as string[],
      aiAdvice: item.ai_advice,
    }));
  });

export const saveAudioAnalysis = createServerFn({ method: "POST" })
  .validator((data: { topic: string; transcript: string; analysis: AudioAnalysis }) => data)
  .handler(async ({ data }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { error } = await supabase
      .from("studyia_audio_history")
      .insert({
        user_id: user.id,
        topic: data.topic,
        transcript: data.transcript,
        score: data.analysis.score,
        accurate_points: data.analysis.accuratePoints,
        missing_concepts: data.analysis.missingConcepts,
        ai_advice: data.analysis.aiAdvice,
      });

    if (error) {
      throw new Error(`Erro ao salvar no banco: ${error.message}`);
    }

    return true;
  });

export const clearAudioHistory = createServerFn({ method: "POST" })
  .handler(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { error } = await supabase
      .from("studyia_audio_history")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      throw new Error(`Erro ao limpar histórico: ${error.message}`);
    }

    return true;
  });
