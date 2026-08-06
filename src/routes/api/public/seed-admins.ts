import { createFileRoute } from "@tanstack/react-router";

const ADMINS = [
  { email: "zaqq135753@gmail.com", password: "Nxa!Admin#2026" },
  { email: "admin1@nxa.app", password: "Nxa!Admin#2026" },
  { email: "admin2@nxa.app", password: "Nxa!Admin#2026" },
];

async function seed() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const results: Array<{ email: string; status: string; id?: string }> = [];

  for (const a of ADMINS) {
    // Try find existing
    let userId: string | undefined;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === a.email);
    if (existing) {
      userId = existing.id;
      // Ensure password is set/known
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: a.password,
        email_confirm: true,
      });
      results.push({ email: a.email, status: "updated", id: userId });
    } else {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: a.email,
        password: a.password,
        email_confirm: true,
      });
      if (error || !created?.user) {
        results.push({ email: a.email, status: `error: ${error?.message ?? "unknown"}` });
        continue;
      }
      userId = created.user.id;
      results.push({ email: a.email, status: "created", id: userId });
    }
    if (userId) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    }
  }
  return results;
}

export const Route = createFileRoute("/api/public/seed-admins")({
  server: {
    handlers: {
      GET: async () => {
        const results = await seed();
        return new Response(JSON.stringify({ ok: true, results }, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
      POST: async () => {
        const results = await seed();
        return new Response(JSON.stringify({ ok: true, results }, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
