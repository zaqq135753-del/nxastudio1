import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ROIData = {
  timeSavedHours: number;
  moneySavedBrl: number;
  tasksAutomated: number;
  efficiencyGainPct: number;
};

export const getROIDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const userId = context.userId;

    // Buscamos dados reais das tabelas existentes para basear o ROI
    const [
      { count: postCount },
      { count: recipeCount },
      { count: granaCount },
      { count: studySessions }
    ] = await Promise.all([
      sb.from("feed_posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
      sb.from("saved_recipes").select("*", { count: "exact", head: true }).eq("user_id", userId),
      sb.from("fin_transactions").select("*", { count: "exact", head: true }).eq("user_id", userId),
      sb.from("lang_sessions").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    // Fórmulas de ROI NXA Studio
    // 1 post = 30 min economizados (copywriting IA)
    // 1 receita = 15 min de planejamento (kitchen planning IA)
    // 1 transação = 5 min de controle manual (OCR/Sync financeiro)
    // 1 sessão de estudo = 45 min de tutor particular
    
    const posts = postCount ?? 0;
    const recipes = recipeCount ?? 0;
    const transactions = granaCount ?? 0;
    const studies = studySessions ?? 0;

    const timeSavedMin = (posts * 30) + (recipes * 15) + (transactions * 5) + (studies * 45);
    const timeSavedHours = Math.round(timeSavedMin / 60);
    
    // Estimativa financeira baseada em valor de hora média (R$ 50/h)
    const moneySavedBrl = timeSavedHours * 50;
    
    const tasksAutomated = posts + recipes + transactions + studies;
    
    // Ganho de eficiência (arbitrário baseado no uso)
    const efficiencyGainPct = Math.min(85, Math.round((tasksAutomated / 10) * 15));

    return {
      timeSavedHours,
      moneySavedBrl,
      tasksAutomated,
      efficiencyGainPct
    } as ROIData;
  });
