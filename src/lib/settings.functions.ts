import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SLUGS = ["saboria","socialia","petia","fluencyia","glowia","granaia","fitia","styleia","cosmosia","roteiroia"] as const;

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}

export type PricingOverride = {
  app_slug: string;
  base_monthly: number | null;
  base_price_label: string | null;
  base_tagline: string | null;
  prime_monthly: number | null;
  prime_price_label: string | null;
  prime_tagline: string | null;
  updated_at: string;
};

export type PlatformSetting = {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
};

/** Public read: everyone (even anon) can fetch pricing overrides so the UI reflects admin edits. */
export const getPricingOverrides = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await client.from("app_pricing_overrides").select("*");
  if (error) throw error;
  return (data ?? []) as PricingOverride[];
});

export const getPlatformSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await client.from("platform_settings").select("*").order("key");
  if (error) throw error;
  return (data ?? []) as PlatformSetting[];
});

export const adminUpsertPricingOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      app_slug: z.enum(SLUGS),
      base_monthly: z.number().int().min(0).nullable().optional(),
      base_price_label: z.string().max(80).nullable().optional(),
      base_tagline: z.string().max(240).nullable().optional(),
      prime_monthly: z.number().int().min(0).nullable().optional(),
      prime_price_label: z.string().max(80).nullable().optional(),
      prime_tagline: z.string().max(240).nullable().optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_pricing_overrides")
      .upsert({ ...data, updated_by: context.userId, updated_at: new Date().toISOString() }, { onConflict: "app_slug" });
    if (error) throw error;
    return { ok: true };
  });

export const adminResetPricingOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ app_slug: z.enum(SLUGS) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_pricing_overrides")
      .delete()
      .eq("app_slug", data.app_slug);
    if (error) throw error;
    return { ok: true };
  });

export const adminUpsertSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      key: z.string().min(1).max(80),
      value: z.any(),
      description: z.string().max(240).nullable().optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("platform_settings")
      .upsert({
        key: data.key,
        value: data.value,
        description: data.description ?? null,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ key: z.string().min(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("platform_settings").delete().eq("key", data.key);
    if (error) throw error;
    return { ok: true };
  });

/** Admin diagnostics: list of tables the panel exposes for quick reference. */
export const adminTableCounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tables = [
      "profiles", "user_roles", "app_entitlements", "app_pricing_overrides",
      "platform_settings", "saved_recipes", "feed_posts", "notifications",
      "user_xp", "user_badges", "affiliates", "affiliate_referrals",
    ];
    const results = await Promise.all(
      tables.map(async (t) => {
        const { count } = await supabaseAdmin.from(t).select("*", { count: "exact", head: true });
        return { table: t, count: count ?? 0 };
      }),
    );
    return results;
  });
