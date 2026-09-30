import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AppHero } from "./AppHero";
import { AICommandBar } from "./AICommandBar";
import { MissionCard } from "./MissionCard";
import { AutopilotCard } from "./AutopilotCard";
import { MediaMemoryPanel } from "./MediaMemoryPanel";
import { DailyMissionCard } from "./DailyMissionCard";
import { AppDataSummary } from "./AppDataSummary";
import { SectionHeader } from "./SectionHeader";
import { RealtimeCallButton } from "@/components/voice/RealtimeCallButton";
import { AppOnboarding } from "./AppOnboarding";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getAppConfig } from "@/apps/config";
import { getAppVisual, appThemeClass } from "@/apps/visual";
import { Bell } from "lucide-react";
import { StudyIncentiveTicker, VipCodeRedeem } from "./StudyIncentive";
import { CrossAppPromoBanner } from "./CrossAppPromoBanner";

import { ScorePredictorWidget } from "./ScorePredictorWidget";

type Props = {
  slug: string;
  /** Pilot apps que ganham botão de voz realtime. */
  showVoice?: boolean;
};

/**
 * Template padrão da home de cada app (Onda D + evolução visual).
 * Aplica tema por nicho (app-<theme>), missão diária colorida e seções editoriais.
 */
export function AppMissionHome({ slug, showVoice = false }: Props) {
  const cfg = getAppConfig(slug);
  const visual = getAppVisual(slug);
  const navigate = useNavigate();
  const { status, isPrime } = useEntitlements();
  const st = status(slug);
  const prime = isPrime(slug);

  const heroStatus: "trial" | "prime" | "base" | "locked" | "available" =
    st.status === "trial" ? "trial"
    : st.status === "active" && st.tier === "prime" ? "prime"
    : st.status === "active" ? "base"
    : st.status === "locked" ? "locked"
    : "available";
  const trialDaysLeft = st.status === "trial" && st.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(st.trialEndsAt).getTime() - Date.now()) / 86400000))
    : undefined;

  function askAgent(prompt: string) {
    sessionStorage.setItem("nxa:agent:seed", prompt);
    sessionStorage.setItem("nxa:agent:appSlug", slug);
    void navigate({ to: "/agente" });
  }

  if (!cfg) {
    return (
      <AppShell appSlug={slug}>
        <div className="py-12 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          App não configurado.
        </div>
      </AppShell>
    );
  }

  const sec = visual?.sectionTitles;

  return (
    <AppShell appSlug={slug}>
      <AppOnboarding slug={slug} />
      <div className={appThemeClass(slug)}>
        <AppHero
          app={cfg}
          status={heroStatus}
          trialDaysLeft={trialDaysLeft}
          action={showVoice ? <div className="flex justify-start"><RealtimeCallButton slug={slug} /></div> : undefined}
        />

        {slug === "studyia" && (
          <div className="fade-up">
            <ScorePredictorWidget />
            <StudyIncentiveTicker />
            <VipCodeRedeem />
          </div>
        )}

        <CrossAppPromoBanner currentSlug={slug} />

        {visual && (
          <section className="mb-6">
            <DailyMissionCard slug={slug} />
          </section>
        )}

        <AppDataSummary slug={slug} />

        <section className="mb-6">
          <AICommandBar
            appSlug={slug}
            placeholder={cfg.helpMePrompt}
            suggestions={cfg.suggestions}
            onSubmit={askAgent}
          />
        </section>

        {cfg.smartNotification && (
          <section className="mb-8 fade-up">
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-r from-card via-card to-primary/5 p-4 sm:p-5 shadow-sm backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-md">
              <div className="flex items-start gap-3.5">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                  <Bell size={18} />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      ⚡ Sugestão em Tempo Real
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Atualizado agora
                    </span>
                  </div>
                  <div className="text-sm sm:text-[15px] font-medium text-foreground leading-snug">
                    {cfg.smartNotification}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-10">
          <SectionHeader
            kicker={sec?.quick ?? "Ações rápidas"}
            title="O que você quer fazer hoje?"
          />
          <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cfg.missions.map((m) => (
              <MissionCard
                key={m.id}
                mission={m}
                isPrime={prime}
                appSlug={slug}
                onClick={m.prime && !prime
                  ? () => navigate({ to: "/assinar/$slug", params: { slug } })
                  : undefined}
              />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader
            kicker={sec?.prime ?? "Modo Prime"}
            title="Automatize o que você faz toda semana"
          />
          <AutopilotCard app={cfg} isPrime={prime} />
        </section>

        <section className="mb-10">
          <SectionHeader
            kicker={sec?.history ?? "Sua base pessoal"}
            title="Memória e mídia"
          />
          <MediaMemoryPanel app={cfg} isPrime={prime} />
        </section>
      </div>
    </AppShell>
  );
}
