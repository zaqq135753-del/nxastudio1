import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import type { AppMission } from "@/apps/config";
import { getAppVisual, appThemeClass } from "@/apps/visual";

type Props = {
  mission: AppMission;
  isPrime?: boolean;
  onClick?: () => void;
  /** Slug do app dono da missão — habilita emoji + acento por nicho. */
  appSlug?: string;
};

/**
 * Card centrado na missão do usuário, não no nome da feature.
 * Locked → mostra cadeado Prime. Se `appSlug` for passado, herda
 * emoji e cor do app (Onda visual).
 */
export function MissionCard({ mission, isPrime = false, onClick, appSlug }: Props) {
  const locked = mission.prime && !isPrime;
  const Icon = mission.icon;
  const visual = getAppVisual(appSlug);
  const themeCls = appThemeClass(appSlug);

  const commonInner = (
    <>
      <div className="flex items-start justify-between gap-3">
        {visual ? (
          <div className="app-icon-bubble" aria-hidden>
            <span className="text-[18px] leading-none">{visual.emoji}</span>
          </div>
        ) : (
          <div className="tile-icon-wrap"><Icon size={18} /></div>
        )}
        <div className="flex items-center gap-1.5">
          {mission.prime && (
            <span className="prime-badge">Prime</span>
          )}
          {locked
            ? <Lock size={14} style={{ color: "var(--n-500)" }} />
            : <ArrowRight size={14} className="arrow-slide tile-arrow" />}
        </div>
      </div>
      <div className="mt-3">
        <div className="tile-title">{mission.label}</div>
        <div className="tile-desc mt-0.5">{mission.desc}</div>
      </div>
      {/* silence unused imports on non-visual path */}
      {!visual && mission.prime && <Sparkles className="hidden" />}
    </>
  );

  const cls = `tile-hero group ${themeCls}`;

  if (onClick || locked) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${cls} text-left w-full`}
        data-locked={locked || undefined}
      >
        {commonInner}
      </button>
    );
  }

  return (
    <Link to={mission.to} className={cls}>
      {commonInner}
    </Link>
  );
}

