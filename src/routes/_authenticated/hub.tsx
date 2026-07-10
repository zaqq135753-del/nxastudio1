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
    <div className="min-h-screen bg-aurora relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-0">
        <span className="aurora-orb aurora-orb-1" />
        <span className="aurora-orb aurora-orb-2" />
        <span className="aurora-orb aurora-orb-3" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 glass" style={{ borderBottom: "1px solid var(--line-1)" }}>
        <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between px-5">
          <Link to="/hub" className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
            <SUITE.icon size={18} /> {SUITE.name}
          </Link>
          <button onClick={signOut} title="Sair"
            className="press flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
            style={{ background: "var(--n-100)" }}>
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> :
              <span className="text-sm font-semibold">{initial}</span>}
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-[960px] px-5 pt-24 pb-16 z-10">
        <div className="fade-up mb-10">
          <div className="ai-badge mb-4"><Sparkles size={12} /> {SUITE.tagline}</div>
          <h1 className="text-[34px] sm:text-6xl font-bold tracking-tight leading-[1.05]">
            {greeting()}{name ? "," : "."}
            {name && <> <span className="text-gradient">{name}</span>.</>}
          </h1>
          <p className="mt-3 text-[15px] sm:text-lg max-w-xl" style={{ color: "var(--muted-foreground)" }}>
            Escolha um app pra abrir ou descubra os próximos da suíte.
          </p>
        </div>

        <section className="mb-12">
          <div className="edition-tag mb-4">Seus apps</div>
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[0,1,2,3].map(i => <div key={i} className="animate-shimmer-bg rounded-3xl h-32" />)}
            </div>
          ) : mine.length === 0 ? (
            <div className="glass-card p-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Nenhum app ativo ainda. Explore abaixo.
            </div>
          ) : (
            <div className="stagger grid gap-4 sm:grid-cols-2">
              {mine.map((a) => (
                <Link key={a.slug} to={a.route} className="glass-card hover-tilt press group p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl grid place-items-center shrink-0"
                         style={{ background: "var(--grad-sunset)" }}>
                      <a.icon size={20} className="text-white" />
                    </div>
                    <ArrowRight size={16} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <div className="text-[17px] font-semibold tracking-tight">{a.name}</div>
                    <div className="text-[13px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {discover.length > 0 && (
          <section>
            <div className="edition-tag mb-4">Descobrir</div>
            <div className="stagger grid gap-4 sm:grid-cols-2">
              {discover.map((a) => {
                const soon = a.status === "soon";
                return (
                  <div key={a.slug} className="glass-card hover-lift p-5 flex flex-col gap-3 relative">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-2xl grid place-items-center shrink-0 opacity-70"
                           style={{ background: "var(--grad-ocean)" }}>
                        <a.icon size={20} className="text-white" />
                      </div>
                      <span className="ai-badge text-[10px]">
                        {soon ? "Em breve" : <><Lock size={10} className="mr-1 inline" />Bloqueado</>}
                      </span>
                    </div>
                    <div>
                      <div className="text-[17px] font-semibold tracking-tight">{a.name}</div>
                      <div className="text-[13px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.description}</div>
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
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
