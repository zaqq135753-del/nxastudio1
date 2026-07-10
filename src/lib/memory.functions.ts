import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const RememberSchema = z.object({
  appSlug: z.string(),
  kind: z.string().default("note"),
  content: z.string().min(1).max(4000),
  metadata: z.record(z.string(), z.any()).optional(),
});

/** Save a memory for the current user. Embedding runs best-effort. */
export const remember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RememberSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { embed } = await import("./memory.server");
    const vec = await embed(`${data.kind}: ${data.content}`);
    const { error } = await context.supabase.from("user_memories").insert({
      user_id: context.userId,
      app_slug: data.appSlug,
      kind: data.kind,
      content: data.content,
      embedding: vec as unknown as string | null,
      metadata: data.metadata ?? {},
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const RecallSchema = z.object({
  query: z.string().min(1),
  appSlugs: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(20).default(6),
});

/** Retrieve top-K semantically relevant memories for the current user. */
export const recall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RecallSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { embed } = await import("./memory.server");
    const vec = await embed(data.query);
    if (!vec) return { memories: [] as Array<{ content: string; app_slug: string; kind: string; similarity: number }> };
    const { data: rows, error } = await context.supabase.rpc("match_user_memories", {
      _user_id: context.userId,
      _query_embedding: vec as unknown as string,
      _app_slugs: data.appSlugs ?? null,
      _match_count: data.limit,
    });
    if (error) return { memories: [] };
    return { memories: rows ?? [] };
  });

/** List latest memories (for a "your memory" surface). */
export const listMemories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ appSlug: z.string().optional(), limit: z.number().default(50) }).parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("user_memories")
      .select("id, app_slug, kind, content, metadata, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.appSlug) q = q.eq("app_slug", data.appSlug);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const forgetMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_memories")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
