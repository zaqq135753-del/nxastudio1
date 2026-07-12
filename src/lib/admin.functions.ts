import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SUPER_ADMIN_EMAILS = new Set(["zaqq135753@gmail.com"]);

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

    const { data: usersData, error: uErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
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
      apps: entsByUser.get(u.id) ?? [],
    }));
    rows.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    return rows;
  });

const SLUGS = ["saboria","socialia","petia","fluencyia","glowia","granaia","fitia","styleia","cosmosia","roteiroia"] as const;

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

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [users, ents, admins] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 1 }),
      supabaseAdmin.from("app_entitlements").select("app_slug,status,tier"),
      supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin"),
    ]);
    const rows = ents.data ?? [];
    return {
      totalUsers: (users.data as any)?.total ?? users.data?.users?.length ?? 0,
      totalAdmins: admins.data?.length ?? 0,
      activeSubs: rows.filter((r: any) => r.status === "active").length,
      trials: rows.filter((r: any) => r.status === "trial").length,
      prime: rows.filter((r: any) => r.tier === "prime" && r.status !== "canceled").length,
    };
  });
