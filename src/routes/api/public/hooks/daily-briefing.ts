import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { buildBriefingFor } from "@/lib/agent.functions";

/**
 * Cron endpoint (público — protegido por apikey via pg_cron).
 * Gera um briefing pro usuário e insere 1..3 notificações.
 *
 * Aceita:
 *   { userId: "..." }  → um usuário específico
 *   { }                → todos os usuários com entitlement ativo
 */
export const Route = createFileRoute("/api/public/hooks/daily-briefing")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = process.env.SUPABASE_URL!;
        const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        if (!url || !service) return new Response("missing env", { status: 500 });
        const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

        let body: { userId?: string } = {};
        try { body = await request.json(); } catch { /* empty body ok */ }

        let userIds: string[] = [];
        if (body.userId) userIds = [body.userId];
        else {
          const { data } = await admin
            .from("app_entitlements")
            .select("user_id")
            .eq("status", "active")
            .limit(1000);
          userIds = Array.from(new Set(((data as Array<{ user_id: string }> | null) ?? []).map((r) => r.user_id)));
        }

        let ok = 0, fail = 0;
        for (const uid of userIds) {
          try {
            const b = await buildBriefingFor(admin as never, uid);
            const rows = b.items.slice(0, 3).map((it) => ({
              user_id: uid,
              kind: "briefing",
              app_slug: it.app,
              title: it.title,
              body: it.reason,
              route: it.route,
              metadata: { action: it.action, headline: b.headline },
            }));
            if (rows.length) {
              const { error } = await admin.from("notifications").insert(rows);
              if (error) throw new Error(error.message);
            }
            ok++;
          } catch (e) {
            console.error("[daily-briefing] user", uid, e);
            fail++;
          }
        }
        return Response.json({ ok, fail, total: userIds.length });
      },
    },
  },
});
