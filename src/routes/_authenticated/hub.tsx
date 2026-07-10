import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { APPS, SUITE } from "@/apps/registry";
import { getMyEntitlements, isEntitled, type Entitlement } from "@/lib/entitlements.functions";
import { ArrowRight, ChevronRight, LogOut, Lock, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/hub")({
  component: Hub,
});

function Hub() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [initial, setInitial] = useState("S");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [ents, setEnts] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useServerFn(getMyEntitlements);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (u) {
        const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
        const dn = (meta.name as string) ?? (meta.full_name as string) ?? u.email ?? "";
        setName(dn.split(" ")[0] ?? "");
        setInitial((dn || "S").charAt(0).toUpperCase());
        setAvatar((meta.avatar_url as string) ?? null);
      }
      try {
        const res = await load();
        setEnts(res);
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const mine = APPS.filter((a) => a.status === "live" && isEntitled(ents, a.slug));
  const discover = APPS.filter((a) => !mine.includes(a));

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-40 glass" style={{ borderBottom: "1px solid var(--line-1)" }}>
        <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between px-5">
          <Link to="/hub" className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
            <SUITE.icon size={18} /> {SUITE.name}
          </Link>
          <button onClick={signOut} title="Sair"
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
            style={{ background: "var(--n-100)" }}>
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> :
              <span className="text-sm font-semibold">{initial}</span>}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-5 pt-24 pb-16">
        <div className="fade-up mb-10">
          <div className="chip mb-3"><Sparkles size={12} /> {SUITE.tagline}</div>
          <h1 className="text-[32px] sm:text-5xl font-bold tracking-tight">
            {greeting()}{name ? `, ${name}` : ""}.
          </h1>
          <p className="mt-2 text-[15px] sm:text-base" style={{ color: "var(--n-500)" }}>
            Escolha um app pra abrir ou descubra os próximos.
          </p>
        </div>

        <section className="mb-12">
          <div className="edition-tag mb-4">Seus apps</div>
          {loading ? (
            <div className="surface p-6 text-sm" style={{ color: "var(--n-500)" }}>Carregando…</div>
          ) : mine.length === 0 ? (
            <div className="surface p-6 text-sm" style={{ color: "var(--n-500)" }}>
              Nenhum app ativo ainda. Explore abaixo.
            </div>
          ) : (
            <div className="stagger grid gap-3 sm:grid-cols-2">
              {mine.map((a) => (
                <Link key={a.slug} to={a.route} className="tile-hero group">
                  <div className="flex items-start justify-between">
                    <div className="tile-icon-wrap"><a.icon size={20} /></div>
                    <ChevronRight size={16} className="tile-arrow" />
                  </div>
                  <div className="mt-2">
                    <div className="tile-title">{a.name}</div>
                    <div className="tile-desc">{a.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {discover.length > 0 && (
          <section>
            <div className="edition-tag mb-4">Descobrir</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {discover.map((a) => {
                const soon = a.status === "soon";
                return (
                  <div key={a.slug} className="tile-hero relative opacity-90">
                    <div className="flex items-start justify-between">
                      <div className="tile-icon-wrap"><a.icon size={20} /></div>
                      <span className="chip chip-neutral text-[10px]">
                        {soon ? "Em breve" : <><Lock size={10} className="mr-1 inline" />Bloqueado</>}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="tile-title">{a.name}</div>
                      <div className="tile-desc">{a.description}</div>
                    </div>
                    <div className="mt-4 text-xs" style={{ color: "var(--n-500)" }}>
                      {SUITE.pricePerApp} · {soon ? "avisamos quando abrir" : "assine para desbloquear"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
