import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type Streak = {
  app_slug: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
};

export type Badge = {
  id: string;
  badge_slug: string;
  app_slug: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  earned_at: string;
};

const BADGE_RULES: Array<{ slug: string; title: string; description: string; icon: string; when: (s: Streak) => boolean }> = [
  { slug: "first-step",  title: "Primeiro passo",     description: "Você usou um app pela primeira vez.", icon: "sparkles", when: s => s.current_streak >= 1 },
  { slug: "streak-3",    title: "3 dias seguidos",    description: "Consistência começando a aparecer.",   icon: "flame",    when: s => s.current_streak >= 3 },
  { slug: "streak-7",    title: "Uma semana on fire", description: "7 dias seguidos no app.",              icon: "flame",    when: s => s.current_streak >= 7 },
  { slug: "streak-30",   title: "Hábito real",        description: "30 dias seguidos. Isso é hábito.",     icon: "trophy",   when: s => s.current_streak >= 30 },
];

export const pingActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ app_slug: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase
      .from("user_streaks").select("*")
      .eq("user_id", userId).eq("app_slug", data.app_slug).maybeSingle();

    let current = 1, longest = 1, last = today;
    if (existing) {
      const prev = existing.last_activity_date as string | null;
      if (prev === today) {
        current = existing.current_streak;
        longest = existing.longest_streak;
      } else {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        current = prev === yesterday ? existing.current_streak + 1 : 1;
        longest = Math.max(existing.longest_streak, current);
      }
    }

    await supabase.from("user_streaks").upsert({
      user_id: userId, app_slug: data.app_slug,
      current_streak: current, longest_streak: longest, last_activity_date: last,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,app_slug" });

    // Award badges
    const streak: Streak = { app_slug: data.app_slug, current_streak: current, longest_streak: longest, last_activity_date: last };
    const newlyEarned: string[] = [];
    for (const rule of BADGE_RULES) {
      if (!rule.when(streak)) continue;
      const { error } = await supabase.from("user_badges").insert({
        user_id: userId, badge_slug: `${data.app_slug}:${rule.slug}`,
        app_slug: data.app_slug, title: rule.title, description: rule.description, icon: rule.icon,
      });
      if (!error) newlyEarned.push(rule.slug);
    }

    return { current, longest, newlyEarned };
  });

export const getMyStreaks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_streaks").select("app_slug,current_streak,longest_streak,last_activity_date")
      .eq("user_id", context.userId);
    return (data ?? []) as Streak[];
  });

export const getMyBadges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_badges").select("*")
      .eq("user_id", context.userId).order("earned_at", { ascending: false });
    return (data ?? []) as Badge[];
  });
