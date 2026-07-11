import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { APPS, SUITE } from "@/apps/registry";
import { getAppConfig } from "@/apps/config";
import { getMyEntitlements, isEntitled, isPrime as entIsPrime, type Entitlement } from "@/lib/entitlements.functions";
import { amIAdmin } from "@/lib/admin.functions";
import { ArrowUpRight, Lock, Sparkles, LogOut, Command, Bell, Shield } from "lucide-react";
import { PrimeBadge } from "@/components/commerce/PrimeBadge";
import { useQueryClient } from "@tanstack/react-query";
import { BriefingCard } from "@/components/BriefingCard";
import { NotificationBell } from "@/components/NotificationBell";
import { TodayWidget } from "@/components/TodayWidget";
import { NxaMark } from "@/components/NxaMark";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { hasOnboarded } from "@/lib/onboarding.functions";
import { PaywallBanner } from "@/components/PaywallBanner";
import { StreaksBadges } from "@/components/StreaksBadges";
import { AICommandBar } from "@/components/nxa/AICommandBar";
import { MissionCard } from "@/components/nxa/MissionCard";
import { AnimatedAppCard } from "@/components/nxa/AnimatedAppCard";
import { SectionHeader } from "@/components/nxa/SectionHeader";


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
  const [isAdmin, setIsAdmin] = useState(false);
  const load = useServerFn(getMyEntitlements);
  const checkOnb = useServerFn(hasOnboarded);
  const checkAdmin = useServerFn(amIAdmin);

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
      try { const { isAdmin } = await checkAdmin(); setIsAdmin(isAdmin); } catch { /* noop */ }
    })();
  }, [load, checkOnb, checkAdmin]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const mine = APPS.filter((a) => a.status === "live" && isEntitled(ents, a.slug));
  const discover = APPS.filter((a) => !mine.includes(a));

  // "Missões de hoje": primeira missão não-Prime (ou primeira) de cada app ativo
  const missionsToday = useMemo(() => {
    return mine
      .map((a) => {
        const cfg = getAppConfig(a.slug);
        if (!cfg) return null;
        const prime = entIsPrime(ents, a.slug);
        const mission = cfg.missions.find((m) => !m.prime) ?? cfg.missions[0];
        return mission ? { app: a, cfg, mission, isPrime: prime } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .slice(0, 6);
  }, [mine, ents]);

  // Próximas ações inteligentes
  const nextActions = useMemo(() => {
    return mine
      .map((a) => {
        const cfg = getAppConfig(a.slug);
        return cfg ? { app: a, cfg } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .slice(0, 3);
  }, [mine]);

  function askAgent(prompt: string) {
    sessionStorage.setItem("nxa:agent:seed", prompt);
    navigate({ to: "/agente" });
  }

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
            {isAdmin && (
              <Link to="/admin" title="Admin"
                className="press inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold"
                style={{ background: "var(--text-1)", color: "var(--bg-1)" }}>
                <Shield size={13} /> Admin
              </Link>
            )}
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
        {/* Command Center Hero */}
        <section className="fade-up mb-8">
          <div className="ai-badge mb-4"><Sparkles size={12} /> {SUITE.tagline}</div>
          <h1 className="text-[36px] sm:text-[56px] font-bold tracking-tight leading-[1.02]">
            {greeting()}{name ? "," : "."}
            {name && <> <span className="text-gradient">{name}</span>.</>}
          </h1>
          <p className="mt-3 text-[15px] sm:text-lg max-w-xl" style={{ color: "var(--muted-foreground)" }}>
            O que você quer resolver agora? Peça em uma frase — a NXA cuida do resto.
          </p>

          <div className="mt-5 max-w-2xl">
            <AICommandBar
              placeholder="Ex.: monta meu jantar de hoje…"
              suggestions={[
                "Monta meu jantar com o que tenho",
                "Posso comprar um tênis de R$ 300?",
                "Criar post pra hoje",
                "Treino rápido de 20 min",
              ]}
              onSubmit={(t) => askAgent(t)}
            />
          </div>
        </section>

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

        {/* Próximas ações inteligentes (por app ativo) */}
        {nextActions.length > 0 && (
          <section className="mb-8">
            <div className="mb-3 edition-tag">Próximas ações</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {nextActions.map(({ app, cfg }) => (
                <Link key={app.slug} to={app.route}
                  className="press surface p-4 flex items-start gap-3 hover-lift">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
                    style={{ background: "var(--n-100)" }}>
                    <Bell size={16} style={{ color: "var(--n-500)" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--n-500)" }}>
                      {cfg.shortName}
                    </div>
                    <div className="text-sm font-medium leading-snug line-clamp-2">
                      {cfg.smartNotification}
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="mt-1 shrink-0" style={{ color: "var(--n-500)" }} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Widget "Hoje" — próximo passo por app ativo */}
        <TodayWidget ents={ents} />

        {/* Streaks & badges */}
        <div className="mb-6"><StreaksBadges /></div>

        {/* Missões de hoje */}
        {missionsToday.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-end justify-between">
              <div className="edition-tag">Missões pra hoje</div>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                1 clique · sem enrolação
              </span>
            </div>
            <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {missionsToday.map(({ app, mission, isPrime }) => (
                <MissionCard key={app.slug + mission.id} mission={mission} isPrime={isPrime} />
              ))}
            </div>
          </section>
        )}

        {/* Proactive briefing */}
        <section className="mb-10"><BriefingCard /></section>

        {/* My apps grid (compacto) */}
        <section className="mb-14">
          <div className="mb-4 flex items-end justify-between">
            <div className="edition-tag">Seus apps</div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{mine.length} de {APPS.length}</span>
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0,1,2,3,4,5].map(i => <div key={i} className="animate-shimmer-bg rounded-3xl h-40" />)}
            </div>
          ) : mine.length === 0 ? (
            <div className="glass-card p-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Nenhum app ativo ainda. Explore abaixo.
            </div>
          ) : (
            <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((a) => {
                const prime = entIsPrime(ents, a.slug);
                const cfg = getAppConfig(a.slug);
                return (
                <Link key={a.slug} to={a.route}
                  className="press group relative block h-40 overflow-hidden rounded-3xl border"
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
                  <div className="relative flex h-full flex-col justify-between p-4 text-white">
                    <div className="flex items-start justify-between">
                      <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                        <a.icon size={16} />
                      </div>
                      {prime ? <PrimeBadge /> : (
                        <span className="rounded-full bg-white/15 backdrop-blur px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                          Base
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-[17px] font-semibold tracking-tight">{a.name}</div>
                      <div className="text-[12px] text-white/75 mt-0.5 line-clamp-1">
                        {cfg?.cardHook ?? a.tagline}
                      </div>
                    </div>
                  </div>
                </Link>
                );
              })}
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
                  7 dias grátis, depois {SUITE.pricePerApp}.
                </p>
              </div>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {discover.length} disponíve{discover.length === 1 ? "l" : "is"}
              </span>
            </div>
            <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discover.map((a) => {
                const soon = a.status === "soon";
                const cfg = getAppConfig(a.slug);
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
                        <div className="text-[13px] text-white/75 mt-0.5 line-clamp-2">
                          {cfg?.cardHook ?? a.description}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-white/70">{SUITE.pricePerApp}</span>
                          {soon ? (
                            <span className="text-[11px] text-white/60">Avisamos você</span>
                          ) : (
                            <Link to="/assinar/$slug" params={{ slug: a.slug }}
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
