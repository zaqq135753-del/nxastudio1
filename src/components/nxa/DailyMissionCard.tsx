import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getAppVisual, appThemeClass } from "@/apps/visual";

type Props = {
  slug: string;
  /** Override opcional (para casos especiais). */
  headline?: string;
  cta?: string;
  to?: string;
};

/**
 * Hero "Missão de hoje" por app.
 * Puxa emoji + cor do app da camada visual (src/apps/visual.ts).
 */
export function DailyMissionCard({ slug, headline, cta, to }: Props) {
  const v = getAppVisual(slug);
  if (!v) return null;

  const finalHeadline = headline ?? v.mission.headline;
  const finalCta = cta ?? v.mission.cta;
  const finalTo = to ?? v.mission.to;

  return (
    <div className={`${appThemeClass(slug)} mesh-hero-app fade-up relative overflow-hidden rounded-3xl p-6 sm:p-7`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="section-kicker">{v.mission.title.replace(/^[^\s]+\s/, "")}</span>
        {v.mission.badge && <span className="chip-app text-[11px] font-semibold uppercase tracking-wider">{v.mission.badge}</span>}
      </div>
      <div className="flex items-start gap-4">
        <div className="app-icon-bubble text-[26px]" aria-hidden>{v.emoji}</div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight leading-tight">
            {finalHeadline}
          </h2>
          <div className="mt-4">
            <Link
              to={finalTo}
              className="btn-ai-call"
              style={{
                background: "linear-gradient(135deg, var(--app-a), var(--app-b))",
                boxShadow: "0 14px 40px -18px color-mix(in oklab, var(--app-a) 70%, transparent)",
              }}
            >
              {finalCta} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -bottom-6 select-none text-[120px] leading-none opacity-[0.10]"
      >
        {v.emojiSet[1] ?? v.emoji}
      </div>
    </div>
  );
}
