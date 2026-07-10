import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { APPS, SUITE } from "@/apps/registry";
import { getMyEntitlements, isEntitled, type Entitlement } from "@/lib/entitlements.functions";
import { ArrowUpRight, Lock, Sparkles, LogOut, Command } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { BriefingCard } from "@/components/BriefingCard";
import { NotificationBell } from "@/components/NotificationBell";
import { TodayWidget } from "@/components/TodayWidget";
import { NxaMark } from "@/components/NxaMark";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { hasOnboarded } from "@/lib/onboarding.functions";
import { PaywallBanner } from "@/components/PaywallBanner";
import { StreaksBadges } from "@/components/StreaksBadges";

import saboriaCover from "@/assets/cover-saboria.jpg";
import fitiaCover from "@/assets/cover-fitia.jpg";
import granaiaCover from "@/assets/cover-granaia.jpg";
import glowiaCover from "@/assets/cover-glowia.jpg";
import petiaCover from "@/assets/cover-petia.jpg";
import socialiaCover from "@/assets/cover-socialia.jpg";
import fluencyiaCover from "@/assets/cover-fluencyia.jpg";
import styleiaCover from "@/assets/cover-styleia.jpg";
import cosmosiaCover from "@/assets/cover-cosmosia.jpg";
import roteiroiaCover from "@/assets/cover-roteiroia.jpg";

const COVERS: Record<string, string> = {
  saboria: saboriaCover, fitia: fitiaCover, granaia: granaiaCover, glowia: glowiaCover,
  petia: petiaCover, socialia: socialiaCover, fluencyia: fluencyiaCover, styleia: styleiaCover,
  cosmosia: cosmosiaCover, roteiroia: roteiroiaCover,
};

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
  const [onboarded, setOnboarded] = useState(true);
  const load = useServerFn(getMyEntitlements);
  const checkOnb = useServerFn(hasOnboarded);

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
      try { setEnts(await load()); } finally { setLoading(false); }
      try { const { onboarded } = await checkOnb(); setOnboarded(onboarded); } catch { /* noop */ }
    })();
  }, [load, checkOnb]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const mine = APPS.filter((a) => a.status === "live" && isEntitled(ents, a.slug));
  const discover = APPS.filter((a) => !mine.includes(a));
  const featured = mine[0] ?? null;

  return (
    <div className="min-h-screen bg-aurora relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <span className="aurora-orb aurora-orb-1" />
        <span className="aurora-orb aurora-orb-2" />
        <span className="aurora-orb aurora-orb-3" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 glass" style={{ borderBottom: "1px solid var(--line-1)" }}>
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-5">
          <Link to="/hub" className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
            <NxaMark size={22} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]"
              style={{ borderColor: "var(--line-1)", color: "var(--muted-foreground)" }}>
              <Command size={11} /> {mine.length} ativo{mine.length === 1 ? "" : "s"} · {APPS.length} apps
            </span>
            <Link to="/memoria" title="Sua Memória IA"
              className="press hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium hover:bg-[var(--n-100)]"
              style={{ color: "var(--muted-foreground)" }}>
              <Command size={13} /> Memória
            </Link>
            <Link to="/afiliados" title="Programa de afiliados"
              className="press hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium hover:bg-[var(--n-100)]"
              style={{ color: "var(--muted-foreground)" }}>
              🎁 Afiliados
            </Link>
            <NotificationBell />
            <button onClick={signOut} title="Sair"
              className="press flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
              style={{ background: "var(--n-100)" }}>
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> :
                <span className="text-sm font-semibold">{initial}</span>}
            </button>
            <button onClick={signOut} className="hidden sm:inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium hover:bg-[var(--n-100)]"
              style={{ color: "var(--muted-foreground)" }}>
              <LogOut size={13} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1100px] px-5 pt-24 pb-20 z-10">
        {/* Hero */}
        <div className="fade-up mb-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <div className="ai-badge mb-4"><Sparkles size={12} /> {SUITE.tagline}</div>
            <h1 className="text-[38px] sm:text-[64px] font-bold tracking-tight leading-[1.02]">
              {greeting()}{name ? "," : "."}
              {name && <> <span className="text-gradient">{name}</span>.</>}
            </h1>
            <p className="mt-4 text-[15px] sm:text-lg max-w-xl" style={{ color: "var(--muted-foreground)" }}>
              Uma suíte de {APPS.length} apps de IA. Um assinatura, um login, tudo conectado no seu ritmo.
            </p>
          </div>

          {/* Featured spotlight */}
          {featured && (
            <Link to={featured.route}
              className="press group relative block h-56 overflow-hidden rounded-3xl border"
              style={{
                borderColor: "var(--line-1)",
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.85) 100%), url(${COVERS[featured.slug]})`,
                backgroundSize: "cover", backgroundPosition: "center",
                boxShadow: "var(--shadow-elev)",
              }}>
              <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider">
                    Em destaque
                  </span>
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform group-hover:scale-110">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">{featured.name}</div>
                  <div className="mt-0.5 text-sm text-white/75">{featured.tagline}</div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Onboarding CTA */}
        {!onboarded && !loading && (
          <Link to="/onboarding"
            className="press mb-6 flex items-center justify-between gap-4 rounded-3xl border p-5 transition hover:bg-[var(--n-100)]"
            style={{ borderColor: "var(--line-1)" }}>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "var(--text-1)", color: "var(--bg-1)" }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Personalize toda a NXA em 60s</div>
                <div className="text-xs" style={{ color: "var(--n-500)" }}>Suas respostas alimentam todos os apps de uma vez.</div>
              </div>
            </div>
            <ArrowUpRight size={16} style={{ color: "var(--n-500)" }} />
          </Link>
        )}

        {/* Paywall / trial */}
        <div className="mb-6"><PaywallBanner /></div>

        {/* Widget "Hoje" — próximo passo por app ativo */}
        <TodayWidget ents={ents} />

        {/* Streaks & badges */}
        <div className="mb-6"><StreaksBadges /></div>

        {/* Proactive briefing */}
        <section className="mb-10"><BriefingCard /></section>

        {/* My apps grid */}
        <section className="mb-14">
          <div className="mb-4 flex items-end justify-between">
            <div className="edition-tag">Seus apps</div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{mine.length} de {APPS.length}</span>
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0,1,2,3,4,5].map(i => <div key={i} className="animate-shimmer-bg rounded-3xl h-52" />)}
            </div>
          ) : mine.length === 0 ? (
            <div className="glass-card p-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Nenhum app ativo ainda. Explore abaixo.
            </div>
          ) : (
            <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((a) => (
                <Link key={a.slug} to={a.route}
                  className="press group relative block h-52 overflow-hidden rounded-3xl border"
                  style={{
                    borderColor: "var(--line-1)",
                    ["--tile-img" as string]: `url(${COVERS[a.slug]})`,
                  } as CSSProperties}>
                  <div
                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `var(--tile-img)`,
                      backgroundSize: "cover", backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.85) 100%)",
                  }} />
                  <div className="relative flex h-full flex-col justify-between p-5 text-white">
                    <div className="flex items-start justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                        <a.icon size={18} />
                      </div>
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 backdrop-blur opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 translate-x-1">
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[19px] font-semibold tracking-tight">{a.name}</div>
                      <div className="text-[13px] text-white/75 mt-0.5 line-clamp-1">{a.tagline}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Discover / upsell */}
        {discover.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="edition-tag">Adicione mais apps NXA</div>
                <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Já tem sua conta. Ative outro app em 1 clique — 7 dias grátis, depois {SUITE.pricePerApp}.
                </p>
              </div>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{discover.length} disponíve{discover.length === 1 ? "l" : "is"}</span>
            </div>
            <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discover.map((a) => {
                const soon = a.status === "soon";
                return (
                  <div key={a.slug}
                    className="hover-lift relative block h-52 overflow-hidden rounded-3xl border"
                    style={{ borderColor: "var(--line-1)" }}>
                    <div className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${COVERS[a.slug]})`,
                        backgroundSize: "cover", backgroundPosition: "center",
                        filter: "grayscale(0.5) brightness(0.6)",
                      }}
                    />
                    <div className="absolute inset-0" style={{
                      background: "linear-gradient(180deg, rgba(0,0,0,.2) 0%, rgba(0,0,0,.9) 100%)",
                    }} />
                    <div className="relative flex h-full flex-col justify-between p-5 text-white">
                      <div className="flex items-start justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 backdrop-blur">
                          <a.icon size={18} />
                        </div>
                        <span className="rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider inline-flex items-center gap-1">
                          {soon ? "Em breve" : <><Lock size={10} /> Não assinado</>}
                        </span>
                      </div>
                      <div>
                        <div className="text-[19px] font-semibold tracking-tight">{a.name}</div>
                        <div className="text-[13px] text-white/75 mt-0.5 line-clamp-2">{a.description}</div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-white/70">{SUITE.pricePerApp}</span>
                          {soon ? (
                            <span className="text-[11px] text-white/60">Avisamos você</span>
                          ) : (
                            <Link to="/auth" search={{ app: a.slug } as never}
                              className="press inline-flex items-center gap-1 rounded-full bg-white text-black px-3 py-1.5 text-[11px] font-semibold">
                              Assinar <ArrowUpRight size={11} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <VoiceAssistant />
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
