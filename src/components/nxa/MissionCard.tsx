import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import type { AppMission } from "@/apps/config";

type Props = {
  mission: AppMission;
  isPrime?: boolean;
  onClick?: () => void;
};

/**
 * Card centrado na missão do usuário ("Descobrir o que cozinhar agora"),
 * não no nome da feature. Locked → mostra cadeado Prime.
 */
export function MissionCard({ mission, isPrime = false, onClick }: Props) {
  const locked = mission.tier === "prime" && !isPrime;
  const commonInner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="tile-icon-wrap">{mission.emoji}</div>
        <div className="flex items-center gap-1.5">
          {mission.tier === "prime" && (
            <span className="chip chip-neutral inline-flex items-center gap-1 text-[10px]">
              <Sparkles size={10} /> Prime
            </span>
          )}
          {locked ? <Lock size={14} style={{ color: "var(--n-500)" }} /> : <ArrowRight size={14} className="tile-arrow" />}
        </div>
      </div>
      <div className="mt-3">
        <div className="tile-title">{mission.title}</div>
        <div className="tile-desc mt-0.5">{mission.outcome}</div>
      </div>
    </>
  );

  if (onClick || locked) {
    return (
      <button onClick={onClick} className="tile-hero text-left w-full" data-locked={locked || undefined}>
        {commonInner}
      </button>
    );
  }

  return (
    <Link to={mission.to} className="tile-hero group">
      {commonInner}
    </Link>
  );
}
