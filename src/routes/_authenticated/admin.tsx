import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  amIAdmin,
  adminListUsers,
  adminGrantApp,
  adminRevokeApp,
  adminToggleAdmin,
  adminStats,
  type AdminUserRow,
} from "@/lib/admin.functions";
import { APPS } from "@/apps/registry";
import { ArrowLeft, Shield, Trash2, Plus, Crown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { isAdmin } = await amIAdmin();
      if (!isAdmin) throw redirect({ to: "/hub" });
    } catch (e) {
      if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
      throw redirect({ to: "/hub" });
    }
  },
  component: AdminPage,
});

function AdminPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const listFn = useServerFn(adminListUsers);
  const statsFn = useServerFn(adminStats);
  const grantFn = useServerFn(adminGrantApp);
  const revokeFn = useServerFn(adminRevokeApp);
  const toggleFn = useServerFn(adminToggleAdmin);

  async function reload() {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([listFn(), statsFn()]);
      setRows(r);
      setStats(s);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filtered = rows.filter((r) =>
    !q || (r.email ?? "").toLowerCase().includes(q.toLowerCase()) || r.id.includes(q),
  );

  async function grant(user_id: string, slug: string) {
    try {
      await grantFn({ data: { user_id, slug: slug as never, tier: "prime", days: 365 } });
      toast.success("App liberado");
      reload();
    } catch (e) { toast.error((e as Error).message); }
  }
  async function revoke(user_id: string, slug: string) {
    try {
      await revokeFn({ data: { user_id, slug: slug as never } });
      toast.success("Acesso removido");
      reload();
    } catch (e) { toast.error((e as Error).message); }
  }
  async function toggleAdmin(user_id: string, make_admin: boolean) {
    try {
      await toggleFn({ data: { user_id, make_admin } });
      toast.success(make_admin ? "Agora é admin" : "Admin removido");
      reload();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="min-h-screen bg-aurora">
      <header className="fixed top-0 left-0 right-0 z-40 glass" style={{ borderBottom: "1px solid var(--line-1)" }}>
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Link to="/hub" className="press inline-flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
              <ArrowLeft size={14} /> Hub
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
              style={{ borderColor: "var(--line-1)" }}>
              <Shield size={11} /> Admin
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 pt-24 pb-20">
        <h1 className="text-3xl font-bold tracking-tight">Controle da plataforma</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Gerencie usuários, papéis e acessos aos apps NXA.
        </p>

        {/* Stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Usuários", stats?.totalUsers ?? "—"],
            ["Admins", stats?.totalAdmins ?? "—"],
            ["Assinaturas ativas", stats?.activeSubs ?? "—"],
            ["Em trial", stats?.trials ?? "—"],
            ["Contas Prime", stats?.prime ?? "—"],
          ].map(([label, val]) => (
            <div key={label as string} className="surface p-4">
              <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--n-500)" }}>{label}</div>
              <div className="mt-1 text-2xl font-semibold">{val}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mt-8 flex items-center gap-3">
          <input
            className="input-field max-w-sm"
            placeholder="Buscar por email ou id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn-ghost" onClick={reload} disabled={loading}>
            {loading ? "Carregando…" : "Recarregar"}
          </button>
        </div>

        {/* Users */}
        <div className="mt-4 surface overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0" style={{ background: "var(--bg-1)" }}>
                <tr className="text-left" style={{ color: "var(--n-500)" }}>
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">Papel</th>
                  <th className="px-4 py-3 font-medium">Apps</th>
                  <th className="px-4 py-3 font-medium">Liberar app</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t align-top" style={{ borderColor: "var(--line-1)" }}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.email ?? "(sem email)"}</div>
                      <div className="text-[11px]" style={{ color: "var(--n-500)" }}>
                        {new Date(u.created_at).toLocaleDateString()} · {u.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAdmin(u.id, !u.is_admin)}
                        className="press inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                        style={{ borderColor: "var(--line-1)", background: u.is_admin ? "var(--text-1)" : "transparent", color: u.is_admin ? "var(--bg-1)" : "var(--text-1)" }}
                      >
                        {u.is_admin ? <><Crown size={11} /> Admin</> : "User"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.apps.filter(a => a.status !== "canceled").map((a) => (
                          <span key={a.slug}
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                            style={{ borderColor: "var(--line-1)" }}>
                            {a.slug} · {a.tier ?? "base"}
                            <button onClick={() => revoke(u.id, a.slug)} title="Revogar" className="press ml-1 opacity-70 hover:opacity-100">
                              <Trash2 size={10} />
                            </button>
                          </span>
                        ))}
                        {u.apps.filter(a => a.status !== "canceled").length === 0 && (
                          <span className="text-[11px]" style={{ color: "var(--n-500)" }}>—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="input-field !py-1 !text-xs w-40"
                        defaultValue=""
                        onChange={(e) => { if (e.target.value) { grant(u.id, e.target.value); e.currentTarget.value = ""; } }}
                      >
                        <option value="">+ Liberar app…</option>
                        {APPS.map((a) => (
                          <option key={a.slug} value={a.slug}>{a.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: "var(--n-500)" }}>Nenhum usuário.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-[11px]" style={{ color: "var(--n-500)" }}>
          <Plus size={10} className="inline" /> "Liberar app" concede acesso Prime por 365 dias. Você pode revogar a qualquer momento.
        </p>
      </main>
    </div>
  );
}
