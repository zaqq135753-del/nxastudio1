import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { levelFromXp } from "./gamification.functions";

export type FeedPost = {
  id: string;
  user_id: string;
  app_slug: string;
  kind: string;
  title: string;
  body: string | null;
  media_url: string | null;
  meta: Record<string, string | number | boolean | null>;
  likes_count: number;
  created_at: string;
  author_name?: string | null;
  author_avatar?: string | null;
  liked_by_me?: boolean;
};

const CreateSchema = z.object({
  app_slug: z.string(),
  title: z.string().min(1).max(140),
  body: z.string().max(2000).optional(),
  media_url: z.string().url().optional(),
  kind: z.string().default("share"),
  meta: z.record(z.string(), z.any()).optional(),
});

export const createFeedPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    
    // Check if it's an image generation or video upload
    let finalMediaUrl = data.media_url;
    
    const { data: row, error } = await sb.from("feed_posts").insert({
      user_id: context.userId,
      app_slug: data.app_slug,
      kind: data.kind,
      title: data.title,
      body: data.body ?? null,
      media_url: finalMediaUrl ?? null,
      meta: {
        ...data.meta,
        client_timestamp: new Date().toISOString(),
      },
    }).select("id").single();
    
    if (error) throw new Error(error.message);
    
    // XP Rewards
    const xpReward = data.kind === 'media' ? 25 : 15;
    const { data: cur } = await sb.from("user_xp").select("total_xp").eq("user_id", context.userId).maybeSingle();
    const total = (cur?.total_xp ?? 0) + xpReward;
    
    await sb.from("user_xp").upsert({
      user_id: context.userId, 
      total_xp: total, 
      level: levelFromXp(total), 
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    
    return { id: row!.id, xp_gained: xpReward };
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { post_id: string; content: string }) => d)
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    // Comments stored in feed_posts as a different 'kind' or a separate table
    // For MVP efficiency, we'll use a comments table if it exists, or just log activity
    const { data: comment, error } = await sb.from("feed_comments").insert({
      post_id: data.post_id,
      user_id: context.userId,
      content: data.content
    }).select("*").single();
    
    if (error) throw new Error(error.message);
    return comment;
  });

export const listComments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { post_id: string }) => d)
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: comments } = await sb.from("feed_comments")
      .select("*, profiles(display_name, avatar_url)")
      .eq("post_id", data.post_id)
      .order("created_at", { ascending: true });
    return comments ?? [];
  });

export const listFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { data: posts } = await sb.from("feed_posts")
      .select("id,user_id,app_slug,kind,title,body,media_url,meta,likes_count,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    const list = (posts ?? []) as FeedPost[];
    if (list.length === 0) return list;

    const userIds = [...new Set(list.map(p => p.user_id))];
    const [{ data: profs }, { data: mine }] = await Promise.all([
      sb.from("profiles").select("id,display_name,avatar_url").in("id", userIds),
      sb.from("feed_likes").select("post_id").eq("user_id", context.userId).in("post_id", list.map(p => p.id)),
    ]);
    const pMap = new Map((profs ?? []).map(p => [p.id, p]));
    const liked = new Set((mine ?? []).map(l => l.post_id));
    return list.map(p => ({
      ...p,
      author_name: pMap.get(p.user_id)?.display_name ?? null,
      author_avatar: pMap.get(p.user_id)?.avatar_url ?? null,
      liked_by_me: liked.has(p.id),
    }));
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { post_id: string }) => d)
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: existing } = await sb.from("feed_likes")
      .select("post_id").eq("user_id", context.userId).eq("post_id", data.post_id).maybeSingle();
    if (existing) {
      await sb.from("feed_likes").delete().eq("user_id", context.userId).eq("post_id", data.post_id);
      return { liked: false };
    }
    await sb.from("feed_likes").insert({ user_id: context.userId, post_id: data.post_id });
    return { liked: true };
  });

export const deleteFeedPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("feed_posts")
      .delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
