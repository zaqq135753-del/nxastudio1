import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SUPER_ADMIN_EMAILS = new Set(["zaqq135753@gmail.com"]);

const SLUGS = ["saboria","socialia","petia","fluencyia","glowia","granaia","fitia","styleia","cosmosia","roteiroia"] as const;
type Slug = typeof SLUGS[number];

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}

async function assertSuperAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  const email = data?.user?.email?.toLowerCase() ?? "";
  if (!SUPER_ADMIN_EMAILS.has(email)) throw new Error("Forbidden: super admin only");
}

export type AdminUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
  provider: string | null;
  apps: Array<{ slug: string; status: string; tier: string | null; expires_at: string | null }>;
};

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    const email = (context.claims?.email ?? "").toString().toLowerCase();
    return { isAdmin: !!data, isSuperAdmin: SUPER_ADMIN_EMAILS.has(email) };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: usersData, error: uErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 500 });
    if (uErr) throw uErr;
    const users = usersData?.users ?? [];
    const ids = users.map((u) => u.id);

    const [{ data: roles }, { data: ents }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("user_id,role").in("user_id", ids),
      supabaseAdmin.from("app_entitlements").select("user_id,app_slug,status,tier,expires_at").in("user_id", ids),
    ]);

    const adminSet = new Set((roles ?? []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));
    const entsByUser = new Map<string, AdminUserRow["apps"]>();
    for (const e of ents ?? []) {
      const arr = entsByUser.get((e as any).user_id) ?? [];
      arr.push({
        slug: (e as any).app_slug,
        status: (e as any).status,
        tier: (e as any).tier,
        expires_at: (e as any).expires_at,
      });
      entsByUser.set((e as any).user_id, arr);
    }

    const rows: AdminUserRow[] = users.map((u) => ({
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      is_admin: adminSet.has(u.id),
      provider: (u.app_metadata as any)?.provider ?? null,
      apps: entsByUser.get(u.id) ?? [],
    }));
    rows.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return rows;
  });

export const adminGrantApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      user_id: z.string().uuid(),
      slug: z.enum(SLUGS),
      tier: z.enum(["base", "prime"]).default("prime"),
      days: z.number().int().min(1).max(3650).default(365),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const expires = new Date(Date.now() + data.days * 86400000).toISOString();
    const { error } = await supabaseAdmin
      .from("app_entitlements")
      .upsert(
        { user_id: data.user_id, app_slug: data.slug, status: "active", tier: data.tier, expires_at: expires },
        { onConflict: "user_id,app_slug" },
      );
    if (error) throw error;
    return { ok: true };
  });

export const adminBulkGrant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      user_ids: z.array(z.string().uuid()).min(1),
      slugs: z.array(z.enum(SLUGS)).min(1),
      tier: z.enum(["base", "prime"]).default("prime"),
      days: z.number().int().min(1).max(3650).default(365),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const expires = new Date(Date.now() + data.days * 86400000).toISOString();
    const rows = data.user_ids.flatMap((uid) =>
      data.slugs.map((slug) => ({
        user_id: uid, app_slug: slug, status: "active", tier: data.tier, expires_at: expires,
      })),
    );
    const { error } = await supabaseAdmin
      .from("app_entitlements")
      .upsert(rows, { onConflict: "user_id,app_slug" });
    if (error) throw error;
    return { ok: true, count: rows.length };
  });

export const adminRevokeApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ user_id: z.string().uuid(), slug: z.enum(SLUGS) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_entitlements")
      .update({ status: "canceled" })
      .eq("user_id", data.user_id)
      .eq("app_slug", data.slug);
    if (error) throw error;
    return { ok: true };
  });

export const adminExtendEntitlement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      user_id: z.string().uuid(),
      slug: z.enum(SLUGS),
      add_days: z.number().int(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("app_entitlements")
      .select("expires_at")
      .eq("user_id", data.user_id).eq("app_slug", data.slug).maybeSingle();
    const base = row?.expires_at ? new Date(row.expires_at).getTime() : Date.now();
    const next = new Date(base + data.add_days * 86400000).toISOString();
    const { error } = await supabaseAdmin
      .from("app_entitlements")
      .update({ expires_at: next, status: "active" })
      .eq("user_id", data.user_id).eq("app_slug", data.slug);
    if (error) throw error;
    return { ok: true, expires_at: next };
  });

export const adminToggleAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ user_id: z.string().uuid(), make_admin: z.boolean() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    await assertSuperAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.make_admin) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.user_id, role: "admin" }, { onConflict: "user_id,role" });
    } else {
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", "admin");
    }
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ user_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    await assertSuperAdmin(context.userId);
    if (data.user_id === context.userId) throw new Error("Você não pode deletar a si mesmo");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw error;
    return { ok: true };
  });

export const adminSendMagicLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ email: z.string().email() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: data.email,
    });
    if (error) throw error;
    return { ok: true, action_link: (link as any)?.properties?.action_link ?? null };
  });

export const adminUserDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ user_id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: u }, ents, xp, streaks, badges, prof] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(data.user_id),
      supabaseAdmin.from("app_entitlements").select("*").eq("user_id", data.user_id),
      supabaseAdmin.from("user_xp").select("*").eq("user_id", data.user_id).maybeSingle(),
      supabaseAdmin.from("user_streaks").select("*").eq("user_id", data.user_id),
      supabaseAdmin.from("user_badges").select("*").eq("user_id", data.user_id),
      supabaseAdmin.from("profiles").select("*").eq("id", data.user_id).maybeSingle(),
    ]);
    return {
      user: {
        id: u?.user?.id,
        email: u?.user?.email ?? null,
        created_at: u?.user?.created_at ?? null,
        last_sign_in_at: u?.user?.last_sign_in_at ?? null,
        provider: (u?.user?.app_metadata as any)?.provider ?? null,
        metadata: u?.user?.user_metadata ?? {},
      },
      profile: prof.data ?? null,
      entitlements: ents.data ?? [],
      xp: xp.data ?? null,
      streaks: streaks.data ?? [],
      badges: badges.data ?? [],
    };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [users, ents, admins] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 1 }),
      supabaseAdmin.from("app_entitlements").select("app_slug,status,tier,expires_at,granted_at"),
      supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin"),
    ]);
    const rows = ents.data ?? [];
    const now = Date.now();
    const active = rows.filter((r: any) =>
      r.status !== "canceled" && (!r.expires_at || new Date(r.expires_at).getTime() > now),
    );
    return {
      totalUsers: (users.data as any)?.total ?? users.data?.users?.length ?? 0,
      totalAdmins: admins.data?.length ?? 0,
      activeSubs: active.length,
      trials: rows.filter((r: any) => r.status === "trial").length,
      prime: active.filter((r: any) => r.tier === "prime").length,
      base: active.filter((r: any) => r.tier === "base").length,
      canceled: rows.filter((r: any) => r.status === "canceled").length,
      expiringIn7d: active.filter((r: any) => r.expires_at && (new Date(r.expires_at).getTime() - now) < 7 * 86400000).length,
    };
  });

export type AppStatRow = {
  slug: string;
  total: number;
  active: number;
  base: number;
  prime: number;
  trial: number;
  canceled: number;
  mrr: number;
};

export const adminAppStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { PRICING } = await import("@/apps/pricing");
    const { data: ents } = await supabaseAdmin
      .from("app_entitlements")
      .select("app_slug,status,tier,expires_at");
    const now = Date.now();
    const map = new Map<string, AppStatRow>();
    for (const slug of SLUGS) {
      map.set(slug, { slug, total: 0, active: 0, base: 0, prime: 0, trial: 0, canceled: 0, mrr: 0 });
    }
    for (const e of (ents ?? []) as any[]) {
      const row = map.get(e.app_slug);
      if (!row) continue;
      row.total++;
      if (e.status === "canceled") { row.canceled++; continue; }
      const stillValid = !e.expires_at || new Date(e.expires_at).getTime() > now;
      if (!stillValid) { row.canceled++; continue; }
      row.active++;
      if (e.status === "trial") row.trial++;
      const p = PRICING[e.app_slug];
      if (e.tier === "prime") {
        row.prime++;
        if (p) row.mrr += (p.base.monthly + p.prime.monthly);
      } else {
        row.base++;
        if (p) row.mrr += p.base.monthly;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.mrr - a.mrr);
  });

export const adminSignupsTrend = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.admin.listUsers({ perPage: 500 });
    const users = data?.users ?? [];
    const buckets: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      buckets.push({ date: key, count: 0 });
    }
    for (const u of users) {
      const key = (u.created_at ?? "").slice(0, 10);
      const b = buckets.find((x) => x.date === key);
      if (b) b.count++;
    }
    return buckets;
  });
