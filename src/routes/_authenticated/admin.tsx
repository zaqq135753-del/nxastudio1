import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  amIAdmin,
  adminListUsers,
  adminGrantApp,
  adminBulkGrant,
  adminRevokeApp,
  adminExtendEntitlement,
  adminToggleAdmin,
  adminDeleteUser,
  adminSendMagicLink,
  adminUserDetail,
  adminStats,
  adminAppStats,
  adminSignupsTrend,
  type AdminUserRow,
  type AppStatRow,
} from "@/lib/admin.functions";
import { APPS } from "@/apps/registry";
import { PRICING } from "@/apps/pricing";
import {
  ArrowLeft, Shield, Trash2, Crown, UserX, X, Mail, Clock, Copy,
  Users, LayoutGrid, DollarSign, Activity, Search, Download, Zap,
} from "lucide-react";

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

type Tab = "overview" | "users" | "apps" | "revenue" | "activity";
type Filter = "all" | "admin" | "trial" | "prime" | "no_apps" | "expiring";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminStats>> | null>(null);
  const [appStats, setAppStats] = useState<AppStatRow[]>([]);
  const [trend, setTrend] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof adminUserDetail>> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [grantTarget, setGrantTarget] = useState<{ user_id: string; email: string | null } | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const fns = {
    list: useServerFn(adminListUsers),
    stats: useServerFn(adminStats),
    apps: useServerFn(adminAppStats),
    trend: useServerFn(adminSignupsTrend),
    me: useServerFn(amIAdmin),
    grant: useServerFn(adminGrantApp),
    bulk: useServerFn(adminBulkGrant),
    revoke: useServerFn(adminRevokeApp),
    extend: useServerFn(adminExtendEntitlement),
    toggle: useServerFn(adminToggleAdmin),
    del: useServerFn(adminDeleteUser),
    magic: useServerFn(adminSendMagicLink),
    detail: useServerFn(adminUserDetail),
  };

  async function reload() {
    setLoading(true);
    try {
      const [r, s, a, t, me] = await Promise.all([
        fns.list(), fns.stats(), fns.apps(), fns.trend(), fns.me(),
      ]);
      setRows(r); setStats(s); setAppStats(a); setTrend(t);
      setIsSuperAdmin(!!me.isSuperAdmin);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }
  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    return rows.filter((u) => {
      if (q && !((u.email ?? "").toLowerCase().includes(q.toLowerCase()) || u.id.includes(q))) return false;
      const activeApps = u.apps.filter((a) => a.status !== "canceled");
      if (filter === "admin" && !u.is_admin) return false;
      if (filter === "trial" && !activeApps.some((a) => a.status === "trial")) return false;
      if (filter === "prime" && !activeApps.some((a) => a.tier === "prime")) return false;
      if (filter === "no_apps" && activeApps.length > 0) return false;
      if (filter === "expiring" && !activeApps.some((a) => a.expires_at && new Date(a.expires_at).getTime() - now < 7 * 86400000)) return false;
      return true;
    });
  }, [rows, q, filter]);

  async function openDetail(user_id: string) {
    setDetailOpen(true); setDetail(null);
    try { setDetail(await fns.detail({ data: { user_id } })); }
    catch (e) { toast.error((e as Error).message); setDetailOpen(false); }
  }

  const mrrTotal = appStats.reduce((s, a) => s + a.mrr, 0);
  const arpu = stats?.totalUsers ? mrrTotal / stats.totalUsers : 0;

  function exportCsv() {
    const header = "email,id,created_at,last_sign_in,is_admin,provider,apps\n";
    const body = rows.map((u) => [
      u.email ?? "", u.id, u.created_at, u.last_sign_in_at ?? "", u.is_admin, u.provider ?? "",
      u.apps.filter((a) => a.status !== "canceled").map((a) => `${a.slug}:${a.tier}`).join("|"),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `nxa-users-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-aurora">
      <header className="fixed top-0 left-0 right-0 z-40 glass" style={{ borderBottom: "1px solid var(--line-1)" }}>
        <div className="mx-auto flex h-14 max-w-[1300px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Link to="/hub" className="press inline-flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
              <ArrowLeft size={14} /> Hub
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
              style={{ borderColor: "var(--line-1)" }}>
              <Shield size={11} /> Console Admin {isSuperAdmin && <span className="ml-1 opacity-70">· super</span>}
            </span>
          </div>
          <button className="btn-ghost text-xs" onClick={exportCsv}><Download size={12} className="mr-1 inline" /> CSV</button>
        </div>
      </header>

      <main className="mx-auto max-w-[1300px] px-5 pt-20 pb-20">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Console de operação</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Controle total da plataforma NXA — usuários, acessos, receita e sistema.
            </p>
          </div>
          <button className="btn-ghost text-xs" onClick={reload} disabled={loading}>
            {loading ? "Carregando…" : "Recarregar tudo"}
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b" style={{ borderColor: "var(--line-1)" }}>
          {[
            ["overview", "Visão geral", LayoutGrid],
            ["users", "Usuários", Users],
            ["apps", "Apps", LayoutGrid],
            ["revenue", "Receita", DollarSign],
            ["activity", "Atividade", Activity],
          ].map(([id, label, Icon]) => (
            <button key={id as string} onClick={() => setTab(id as Tab)}
              className="press inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition"
              style={{
                borderColor: tab === id ? "var(--text-1)" : "transparent",
                color: tab === id ? "var(--text-1)" : "var(--muted-foreground)",
              }}>
              {/* @ts-expect-error dynamic icon */}
              <Icon size={14} /> {label as string}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <section className="mt-6 space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Usuários", stats?.totalUsers, "total cadastrado"],
                ["MRR estimado", `R$ ${mrrTotal.toFixed(0)}`, `ARPU R$ ${arpu.toFixed(2)}`],
                ["Assinaturas ativas", stats?.activeSubs, `${stats?.prime ?? 0} prime · ${stats?.base ?? 0} base`],
                ["Vencendo em 7d", stats?.expiringIn7d, "requer atenção"],
              ].map(([label, val, hint]) => (
                <div key={label as string} className="surface p-4">
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--n-500)" }}>{label}</div>
                  <div className="mt-1 text-2xl font-semibold">{val ?? "—"}</div>
                  <div className="mt-0.5 text-[11px]" style={{ color: "var(--n-500)" }}>{hint}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="surface p-5">
                <h3 className="text-sm font-semibold">Top apps por receita</h3>
                <div className="mt-3 space-y-2">
                  {appStats.slice(0, 6).map((a) => {
                    const app = APPS.find((x) => x.slug === a.slug);
                    const pct = mrrTotal ? (a.mrr / mrrTotal) * 100 : 0;
                    return (
                      <div key={a.slug} className="flex items-center gap-3">
                        <div className="w-24 text-xs font-medium">{app?.name ?? a.slug}</div>
                        <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--line-1)" }}>
                          <div style={{ width: `${pct}%`, background: "var(--text-1)", height: "100%" }} />
                        </div>
                        <div className="w-20 text-right text-xs tabular-nums">R$ {a.mrr}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="surface p-5">
                <h3 className="text-sm font-semibold">Cadastros — últimos 14 dias</h3>
                <MiniBars data={trend} />
              </div>
            </div>
          </section>
        )}

        {tab === "users" && (
          <section className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                <input className="input-field w-72 pl-8" placeholder="Buscar email ou id…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              {(["all","admin","trial","prime","no_apps","expiring"] as Filter[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="press rounded-full border px-3 py-1 text-[11px] font-medium"
                  style={{ borderColor: "var(--line-1)", background: filter === f ? "var(--text-1)" : "transparent", color: filter === f ? "var(--bg-1)" : "var(--text-1)" }}>
                  {({all:"Todos",admin:"Admins",trial:"Em trial",prime:"Prime",no_apps:"Sem apps",expiring:"Vencendo 7d"} as any)[f]}
                </button>
              ))}
              <div className="ml-auto text-[11px]" style={{ color: "var(--n-500)" }}>{filtered.length} de {rows.length}</div>
            </div>

            {selected.size > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "var(--line-1)", background: "var(--bg-2)" }}>
                <b>{selected.size}</b> selecionado(s)
                <button className="btn-ghost text-xs" onClick={() => setBulkOpen(true)}><Zap size={11} className="mr-1 inline" /> Liberar apps em massa</button>
                <button className="btn-ghost text-xs" onClick={() => setSelected(new Set())}>Limpar</button>
              </div>
            )}

            <div className="mt-3 surface overflow-hidden">
              <div className="max-h-[70vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10" style={{ background: "var(--bg-1)" }}>
                    <tr className="text-left" style={{ color: "var(--n-500)" }}>
                      <th className="px-3 py-3 w-8">
                        <input type="checkbox"
                          checked={filtered.length > 0 && filtered.every((u) => selected.has(u.id))}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) filtered.forEach((u) => next.add(u.id));
                            else filtered.forEach((u) => next.delete(u.id));
                            setSelected(next);
                          }} />
                      </th>
                      <th className="px-3 py-3 font-medium">Usuário</th>
                      <th className="px-3 py-3 font-medium">Papel</th>
                      <th className="px-3 py-3 font-medium">Apps ativos</th>
                      <th className="px-3 py-3 font-medium">Último acesso</th>
                      <th className="px-3 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => {
                      const activeApps = u.apps.filter((a) => a.status !== "canceled");
                      return (
                        <tr key={u.id} className="border-t align-top hover:bg-black/[0.02]" style={{ borderColor: "var(--line-1)" }}>
                          <td className="px-3 py-3">
                            <input type="checkbox" checked={selected.has(u.id)}
                              onChange={(e) => {
                                const next = new Set(selected);
                                e.target.checked ? next.add(u.id) : next.delete(u.id);
                                setSelected(next);
                              }} />
                          </td>
                          <td className="px-3 py-3">
                            <button className="press text-left" onClick={() => openDetail(u.id)}>
                              <div className="font-medium underline-offset-2 hover:underline">{u.email ?? "(sem email)"}</div>
                              <div className="text-[11px]" style={{ color: "var(--n-500)" }}>
                                {new Date(u.created_at).toLocaleDateString()} · {u.provider ?? "email"} · {u.id.slice(0, 8)}
                              </div>
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            {isSuperAdmin ? (
                              <button onClick={async () => {
                                try { await fns.toggle({ data: { user_id: u.id, make_admin: !u.is_admin } }); toast.success("Papel atualizado"); reload(); }
                                catch (e) { toast.error((e as Error).message); }
                              }}
                                className="press inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                                style={{ borderColor: "var(--line-1)", background: u.is_admin ? "var(--text-1)" : "transparent", color: u.is_admin ? "var(--bg-1)" : "var(--text-1)" }}>
                                {u.is_admin ? <><Crown size={11} /> Admin</> : "User"}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium opacity-70"
                                style={{ borderColor: "var(--line-1)", background: u.is_admin ? "var(--text-1)" : "transparent", color: u.is_admin ? "var(--bg-1)" : "var(--text-1)" }}>
                                {u.is_admin ? <><Crown size={11} /> Admin</> : "User"}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {activeApps.map((a) => (
                                <span key={a.slug} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                                  style={{ borderColor: "var(--line-1)", background: a.tier === "prime" ? "var(--text-1)" : "transparent", color: a.tier === "prime" ? "var(--bg-1)" : "var(--text-1)" }}
                                  title={a.expires_at ? `Expira ${new Date(a.expires_at).toLocaleDateString()}` : "Sem expiração"}>
                                  {a.slug}·{a.tier ?? "base"}
                                  <button onClick={async () => {
                                    try { await fns.revoke({ data: { user_id: u.id, slug: a.slug as never } }); toast.success("Revogado"); reload(); }
                                    catch (e) { toast.error((e as Error).message); }
                                  }} className="press ml-1 opacity-70 hover:opacity-100"><Trash2 size={10} /></button>
                                </span>
                              ))}
                              {activeApps.length === 0 && <span className="text-[11px]" style={{ color: "var(--n-500)" }}>—</span>}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-[11px]" style={{ color: "var(--n-500)" }}>
                            {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "nunca"}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button className="press rounded-md border px-2 py-1 text-[11px]" style={{ borderColor: "var(--line-1)" }}
                                onClick={() => setGrantTarget({ user_id: u.id, email: u.email })}>+ App</button>
                              <button className="press rounded-md border px-2 py-1 text-[11px]" style={{ borderColor: "var(--line-1)" }}
                                onClick={async () => {
                                  if (!u.email) return;
                                  try {
                                    const r = await fns.magic({ data: { email: u.email } });
                                    if (r.action_link) { await navigator.clipboard.writeText(r.action_link); toast.success("Magic link copiado"); }
                                    else toast.success("Link enviado");
                                  } catch (e) { toast.error((e as Error).message); }
                                }} title="Enviar magic link"><Mail size={11} /></button>
                              {isSuperAdmin && (
                                <button className="press rounded-md border px-2 py-1 text-[11px]" style={{ borderColor: "var(--line-1)", color: "var(--danger, #ef4444)" }}
                                  onClick={async () => {
                                    if (!confirm(`Deletar ${u.email ?? u.id}?`)) return;
                                    try { await fns.del({ data: { user_id: u.id } }); toast.success("Deletado"); reload(); }
                                    catch (e) { toast.error((e as Error).message); }
                                  }}><UserX size={11} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!loading && filtered.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--n-500)" }}>Nenhum usuário.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {tab === "apps" && (
          <section className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {appStats.map((a) => {
              const app = APPS.find((x) => x.slug === a.slug);
              const p = PRICING[a.slug];
              return (
                <div key={a.slug} className="surface p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{app?.name ?? a.slug}</div>
                    <span className="text-[11px]" style={{ color: "var(--n-500)" }}>{a.slug}</span>
                  </div>
                  <div className="mt-1 text-[11px]" style={{ color: "var(--n-500)" }}>{p?.base.priceLabel} · +{p?.prime.priceLabel} prime</div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                    <Stat label="Ativos" v={a.active} />
                    <Stat label="Base" v={a.base} />
                    <Stat label="Prime" v={a.prime} />
                    <Stat label="Trial" v={a.trial} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-2 text-xs" style={{ borderColor: "var(--line-1)" }}>
                    <span style={{ color: "var(--n-500)" }}>MRR</span>
                    <span className="text-base font-semibold">R$ {a.mrr}</span>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {tab === "revenue" && (
          <section className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface p-5">
                <div className="text-[11px] uppercase" style={{ color: "var(--n-500)" }}>MRR estimado</div>
                <div className="mt-1 text-3xl font-bold">R$ {mrrTotal.toFixed(0)}</div>
                <div className="text-[11px]" style={{ color: "var(--n-500)" }}>ARR ≈ R$ {(mrrTotal * 12).toFixed(0)}</div>
              </div>
              <div className="surface p-5">
                <div className="text-[11px] uppercase" style={{ color: "var(--n-500)" }}>ARPU</div>
                <div className="mt-1 text-3xl font-bold">R$ {arpu.toFixed(2)}</div>
                <div className="text-[11px]" style={{ color: "var(--n-500)" }}>por usuário cadastrado</div>
              </div>
              <div className="surface p-5">
                <div className="text-[11px] uppercase" style={{ color: "var(--n-500)" }}>Mix Prime</div>
                <div className="mt-1 text-3xl font-bold">
                  {stats?.activeSubs ? Math.round(((stats.prime ?? 0) / stats.activeSubs) * 100) : 0}%
                </div>
                <div className="text-[11px]" style={{ color: "var(--n-500)" }}>{stats?.prime ?? 0} prime / {stats?.activeSubs ?? 0} ativos</div>
              </div>
            </div>
            <div className="surface p-5">
              <h3 className="text-sm font-semibold">Receita por app</h3>
              <table className="mt-3 w-full text-sm">
                <thead><tr className="text-left text-[11px]" style={{ color: "var(--n-500)" }}>
                  <th className="py-2">App</th><th>Ativos</th><th>Base</th><th>Prime</th><th className="text-right">MRR</th>
                </tr></thead>
                <tbody>
                  {appStats.map((a) => (
                    <tr key={a.slug} className="border-t" style={{ borderColor: "var(--line-1)" }}>
                      <td className="py-2 font-medium">{APPS.find((x) => x.slug === a.slug)?.name ?? a.slug}</td>
                      <td>{a.active}</td><td>{a.base}</td><td>{a.prime}</td>
                      <td className="text-right tabular-nums">R$ {a.mrr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "activity" && (
          <section className="mt-6 space-y-4">
            <div className="surface p-5">
              <h3 className="text-sm font-semibold">Cadastros por dia (últimos 14 dias)</h3>
              <MiniBars data={trend} big />
            </div>
            <div className="surface p-5">
              <h3 className="text-sm font-semibold">Últimos logins</h3>
              <ul className="mt-3 divide-y" style={{ borderColor: "var(--line-1)" }}>
                {rows.filter((r) => r.last_sign_in_at).slice(0, 15).sort((a, b) => (b.last_sign_in_at ?? "").localeCompare(a.last_sign_in_at ?? "")).map((u) => (
                  <li key={u.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{u.email}</span>
                    <span className="text-[11px]" style={{ color: "var(--n-500)" }}>{new Date(u.last_sign_in_at!).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      {/* Grant modal */}
      {grantTarget && (
        <GrantModal
          target={grantTarget}
          onClose={() => setGrantTarget(null)}
          onSubmit={async ({ slug, tier, days }) => {
            try {
              await fns.grant({ data: { user_id: grantTarget.user_id, slug: slug as never, tier, days } });
              toast.success("Acesso liberado"); setGrantTarget(null); reload();
            } catch (e) { toast.error((e as Error).message); }
          }}
        />
      )}

      {/* Bulk modal */}
      {bulkOpen && (
        <BulkGrantModal
          count={selected.size}
          onClose={() => setBulkOpen(false)}
          onSubmit={async ({ slugs, tier, days }) => {
            try {
              const r = await fns.bulk({ data: { user_ids: Array.from(selected), slugs: slugs as never, tier, days } });
              toast.success(`${r.count} acessos concedidos`); setBulkOpen(false); setSelected(new Set()); reload();
            } catch (e) { toast.error((e as Error).message); }
          }}
        />
      )}

      {/* Detail drawer */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setDetailOpen(false)}>
          <div className="h-full w-full max-w-lg overflow-auto p-6" style={{ background: "var(--bg-1)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Detalhes do usuário</h2>
              <button className="press" onClick={() => setDetailOpen(false)}><X size={16} /></button>
            </div>
            {!detail ? <p className="mt-4 text-sm" style={{ color: "var(--n-500)" }}>Carregando…</p> : (
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <div className="text-[11px] uppercase" style={{ color: "var(--n-500)" }}>Identidade</div>
                  <div className="mt-1 font-medium">{detail.user.email}</div>
                  <div className="text-[11px]" style={{ color: "var(--n-500)" }}>
                    {detail.user.provider ?? "email"} · criado {detail.user.created_at ? new Date(detail.user.created_at).toLocaleDateString() : "—"}
                  </div>
                  <button className="press mt-2 inline-flex items-center gap-1 text-[11px] underline" onClick={() => { navigator.clipboard.writeText(detail.user.id ?? ""); toast.success("ID copiado"); }}>
                    <Copy size={11} /> {detail.user.id?.slice(0, 12)}…
                  </button>
                </div>
                <div>
                  <div className="text-[11px] uppercase" style={{ color: "var(--n-500)" }}>XP · Gamificação</div>
                  <div className="mt-1">Nível {(detail.xp as any)?.level ?? 1} · {(detail.xp as any)?.xp ?? 0} XP · {detail.badges.length} badges</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase" style={{ color: "var(--n-500)" }}>Entitlements ({detail.entitlements.length})</div>
                  <ul className="mt-1 space-y-1">
                    {detail.entitlements.map((e: any) => (
                      <li key={e.app_slug} className="flex items-center justify-between rounded border p-2 text-xs" style={{ borderColor: "var(--line-1)" }}>
                        <div>
                          <div className="font-medium">{e.app_slug} · {e.tier}</div>
                          <div className="text-[11px]" style={{ color: "var(--n-500)" }}>
                            {e.status} · {e.expires_at ? `expira ${new Date(e.expires_at).toLocaleDateString()}` : "sem expiração"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="press rounded border px-1.5 py-0.5" style={{ borderColor: "var(--line-1)" }}
                            onClick={async () => {
                              try { await fns.extend({ data: { user_id: detail.user.id!, slug: e.app_slug, add_days: 30 } }); toast.success("+30 dias"); openDetail(detail.user.id!); reload(); }
                              catch (err) { toast.error((err as Error).message); }
                            }}><Clock size={10} className="inline" /> +30d</button>
                          <button className="press rounded border px-1.5 py-0.5" style={{ borderColor: "var(--line-1)", color: "var(--danger, #ef4444)" }}
                            onClick={async () => {
                              try { await fns.revoke({ data: { user_id: detail.user.id!, slug: e.app_slug } }); toast.success("Revogado"); openDetail(detail.user.id!); reload(); }
                              catch (err) { toast.error((err as Error).message); }
                            }}><Trash2 size={10} /></button>
                        </div>
                      </li>
                    ))}
                    {detail.entitlements.length === 0 && <li className="text-[11px]" style={{ color: "var(--n-500)" }}>Nenhum acesso.</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="text-base font-semibold tabular-nums">{v}</div>
      <div className="text-[10px] uppercase" style={{ color: "var(--n-500)" }}>{label}</div>
    </div>
  );
}

function MiniBars({ data, big }: { data: { date: string; count: number }[]; big?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className={`mt-3 flex items-end gap-1 ${big ? "h-40" : "h-24"}`}>
      {data.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t" style={{ height: `${(d.count / max) * 100}%`, background: "var(--text-1)", minHeight: d.count ? 2 : 0 }} title={`${d.date}: ${d.count}`} />
          {big && <div className="text-[9px]" style={{ color: "var(--n-500)" }}>{d.date.slice(5)}</div>}
        </div>
      ))}
    </div>
  );
}

function GrantModal({ target, onClose, onSubmit }: {
  target: { user_id: string; email: string | null };
  onClose: () => void;
  onSubmit: (v: { slug: string; tier: "base" | "prime"; days: number }) => void;
}) {
  const [slug, setSlug] = useState(APPS[0].slug);
  const [tier, setTier] = useState<"base" | "prime">("prime");
  const [days, setDays] = useState(365);
  return (
    <Modal onClose={onClose} title={`Liberar acesso — ${target.email ?? target.user_id.slice(0, 8)}`}>
      <div className="space-y-3">
        <Field label="App">
          <select className="input-field" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {APPS.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Tier">
          <div className="flex gap-2">
            {(["base","prime"] as const).map((t) => (
              <button key={t} onClick={() => setTier(t)}
                className="press flex-1 rounded-md border px-3 py-2 text-sm font-medium"
                style={{ borderColor: "var(--line-1)", background: tier === t ? "var(--text-1)" : "transparent", color: tier === t ? "var(--bg-1)" : "var(--text-1)" }}>
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Duração">
          <div className="flex flex-wrap gap-2">
            {[7, 30, 90, 365, 3650].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className="press rounded-md border px-3 py-1.5 text-xs"
                style={{ borderColor: "var(--line-1)", background: days === d ? "var(--text-1)" : "transparent", color: days === d ? "var(--bg-1)" : "var(--text-1)" }}>
                {d >= 3650 ? "Lifetime" : `${d}d`}
              </button>
            ))}
            <input type="number" className="input-field w-24" value={days} onChange={(e) => setDays(Number(e.target.value) || 30)} />
          </div>
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" onClick={() => onSubmit({ slug, tier, days })}>Liberar</button>
      </div>
    </Modal>
  );
}

function BulkGrantModal({ count, onClose, onSubmit }: {
  count: number;
  onClose: () => void;
  onSubmit: (v: { slugs: string[]; tier: "base" | "prime"; days: number }) => void;
}) {
  const [slugs, setSlugs] = useState<Set<string>>(new Set());
  const [tier, setTier] = useState<"base" | "prime">("prime");
  const [days, setDays] = useState(365);
  return (
    <Modal onClose={onClose} title={`Liberar apps para ${count} usuário(s)`}>
      <div className="space-y-3">
        <Field label="Apps">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setSlugs(new Set(APPS.map((a) => a.slug)))} className="press rounded-full border px-2 py-1 text-[11px]" style={{ borderColor: "var(--line-1)" }}>Todos</button>
            <button onClick={() => setSlugs(new Set())} className="press rounded-full border px-2 py-1 text-[11px]" style={{ borderColor: "var(--line-1)" }}>Limpar</button>
            {APPS.map((a) => (
              <button key={a.slug} onClick={() => {
                const next = new Set(slugs); next.has(a.slug) ? next.delete(a.slug) : next.add(a.slug); setSlugs(next);
              }} className="press rounded-full border px-2.5 py-1 text-[11px]"
                style={{ borderColor: "var(--line-1)", background: slugs.has(a.slug) ? "var(--text-1)" : "transparent", color: slugs.has(a.slug) ? "var(--bg-1)" : "var(--text-1)" }}>
                {a.name}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Tier">
          <div className="flex gap-2">
            {(["base","prime"] as const).map((t) => (
              <button key={t} onClick={() => setTier(t)} className="press flex-1 rounded-md border px-3 py-2 text-sm font-medium"
                style={{ borderColor: "var(--line-1)", background: tier === t ? "var(--text-1)" : "transparent", color: tier === t ? "var(--bg-1)" : "var(--text-1)" }}>{t}</button>
            ))}
          </div>
        </Field>
        <Field label="Duração">
          <div className="flex flex-wrap gap-2">
            {[30, 90, 365, 3650].map((d) => (
              <button key={d} onClick={() => setDays(d)} className="press rounded-md border px-3 py-1.5 text-xs"
                style={{ borderColor: "var(--line-1)", background: days === d ? "var(--text-1)" : "transparent", color: days === d ? "var(--bg-1)" : "var(--text-1)" }}>
                {d >= 3650 ? "Lifetime" : `${d}d`}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" disabled={slugs.size === 0} onClick={() => onSubmit({ slugs: Array.from(slugs), tier, days })}>
          Liberar {slugs.size} × {count}
        </button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border p-5" style={{ background: "var(--bg-1)", borderColor: "var(--line-1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button className="press" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] uppercase" style={{ color: "var(--n-500)" }}>{label}</div>
      {children}
    </div>
  );
}
