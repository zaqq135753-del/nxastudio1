import { getPricing } from "@/apps/pricing";
import { PrimeBadge } from "./PrimeBadge";

export function TrialBanner({ slug, className }: { slug: string; className?: string }) {
  const p = getPricing(slug);
  if (!p) return null;
  return (
    <div
      className={
        "rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm " +
        "text-sm text-white/80 " +
        (className ?? "")
      }
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-base font-semibold text-white">7 dias grátis</span>
        <span className="text-white/60">Depois {p.base.priceLabel}</span>
        <span className="inline-flex items-center gap-2 text-white/60">
          <PrimeBadge /> opcional por {p.prime.priceLabel}
        </span>
      </div>
    </div>
  );
}
