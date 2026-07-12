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
import { useEntitlements } from "@/hooks/useEntitlements";
import { getAppConfig } from "@/apps/config";
import { getAppVisual, appThemeClass } from "@/apps/visual";
import { Bell } from "lucide-react";

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
      <div className={appThemeClass(slug)}>
        <AppHero
          app={cfg}
          status={heroStatus}
          trialDaysLeft={trialDaysLeft}
          action={showVoice ? <div className="flex justify-start"><RealtimeCallButton slug={slug} /></div> : undefined}
        />

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
            <div className="surface flex items-start gap-3 p-4">
              <div className="tile-icon-wrap shrink-0"><Bell size={16} /></div>
              <div className="min-w-0 flex-1">
                <div className="edition-tag mb-1">Próxima ação</div>
                <div className="text-[15px] leading-snug">{cfg.smartNotification}</div>
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
