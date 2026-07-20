import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getPlatformPulse = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    
    // Top users by XP
    const { data: topUsers } = await sb.from("user_xp")
      .select("user_id, total_xp, level")
      .order("total_xp", { ascending: false })
      .limit(5);

    // Recent big wins (shared results from feed)
    const { data: recentWins } = await sb.from("feed_posts")
      .select("id, title, app_slug, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    const userIds = [...new Set([
      ...(topUsers?.map(u => u.user_id) ?? []),
      ...(recentWins?.map(w => w.user_id) ?? [])
    ])];

    const { data: profiles } = await sb.from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);

    const pMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

    return {
      leaderboard: (topUsers ?? []).map(u => ({
        ...u,
        name: pMap.get(u.user_id)?.display_name,
        avatar: pMap.get(u.user_id)?.avatar_url,
      })),
      recentWins: (recentWins ?? []).map(w => ({
        ...w,
        author: pMap.get(w.user_id)?.display_name,
      })),
    };
  });
