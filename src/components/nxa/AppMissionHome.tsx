import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AppHero } from "./AppHero";
import { AICommandBar } from "./AICommandBar";
import { MissionCard } from "./MissionCard";
import { RealtimeCallButton } from "@/components/voice/RealtimeCallButton";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getAppConfig } from "@/apps/config";
import { Bell } from "lucide-react";

type Props = {
  slug: string;
  /** Pilot apps que ganham botão de voz realtime. */
  showVoice?: boolean;
};

/**
 * Template padrão da home de cada app (Onda D).
 * Consome src/apps/config.ts + useEntitlements para renderizar hero,
 * command bar, notificação inteligente e missões com gating Prime.
 */
export function AppMissionHome({ slug, showVoice = false }: Props) {
  const cfg = getAppConfig(slug);
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

  return (
    <AppShell appSlug={slug}>
      <AppHero
        app={cfg}
        status={heroStatus}
        trialDaysLeft={st.kind === "trial" ? st.daysLeft : undefined}
        action={showVoice ? <div className="flex justify-start"><RealtimeCallButton slug={slug} /></div> : undefined}
      />

      <section className="mb-6">
        <AICommandBar
          placeholder={cfg.helpMePrompt}
          suggestions={cfg.suggestions}
          onSubmit={askAgent}
        />
      </section>

      {cfg.smartNotification && (
        <section className="mb-6 fade-up">
          <div className="surface flex items-start gap-3 p-4">
            <div className="tile-icon-wrap shrink-0"><Bell size={16} /></div>
            <div className="min-w-0 flex-1">
              <div className="edition-tag mb-1">Próxima ação</div>
              <div className="text-[15px] leading-snug">{cfg.smartNotification}</div>
            </div>
          </div>
        </section>
      )}

      <section className="mb-8">
        <div className="edition-tag mb-3">Missões pra hoje</div>
        <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cfg.missions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              isPrime={prime}
              onClick={m.prime && !prime
                ? () => navigate({ to: "/assinar/$slug", params: { slug } })
                : undefined}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
