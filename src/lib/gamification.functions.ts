import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type XpRow = { user_id: string; total_xp: number; level: number; display_name: string | null; avatar_url: string | null };

export function levelFromXp(xp: number) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}
export function xpForNextLevel(level: number) {
  return 50 * level * level;
}

async function readMeta(sb: Awaited<ReturnType<typeof getMyXp>> extends never ? never : any, userId: string) {
  // pull name/avatar from profiles if available
  const { data } = await sb.from("profiles").select("full_name,avatar_url").eq("id", userId).maybeSingle();
  return { display_name: (data?.full_name as string) ?? null, avatar_url: (data?.avatar_url as string) ?? null };
}

/** Adiciona XP ao usuário (usado por pingActivity e ações significativas). */
export const awardXp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { amount: number; reason?: string }) => d)
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: cur } = await sb.from("user_xp").select("total_xp").eq("user_id", context.userId).maybeSingle();
    const total = (cur?.total_xp ?? 0) + Math.max(0, data.amount);
    const level = levelFromXp(total);
    const meta = await readMeta(sb, context.userId);
    const { error } = await sb.from("user_xp").upsert({
      user_id: context.userId, total_xp: total, level,
      display_name: meta.display_name, avatar_url: meta.avatar_url,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { total_xp: total, level, next: xpForNextLevel(level) };
  });

export const getMyXp = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("user_xp").select("*").eq("user_id", context.userId).maybeSingle();
    const total = data?.total_xp ?? 0;
    const level = levelFromXp(total);
    return { total_xp: total, level, next: xpForNextLevel(level) };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_xp")
      .select("user_id,total_xp,level,display_name,avatar_url")
      .order("total_xp", { ascending: false })
      .limit(20);
    return (data ?? []) as XpRow[];
  });
