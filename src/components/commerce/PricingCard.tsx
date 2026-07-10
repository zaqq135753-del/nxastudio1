import { Check } from "lucide-react";
import type { Plan } from "@/apps/pricing";
import { cn } from "@/lib/utils";
import { PrimeBadge } from "./PrimeBadge";

type Props = {
  plan: Plan;
  variant: "base" | "prime";
  ctaLabel: string;
  onCta?: () => void;
  disabled?: boolean;
  highlight?: boolean;
};

export function PricingCard({ plan, variant, ctaLabel, onCta, disabled, highlight }: Props) {
  const isPrime = variant === "prime";
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl border p-6 md:p-7",
        "bg-white/[0.03] backdrop-blur-sm",
        isPrime
          ? "border-amber-400/30 shadow-[0_20px_60px_-30px_rgba(251,191,36,0.35)]"
          : "border-white/10",
        highlight && "ring-1 ring-white/20",
      )}
    >
      {isPrime && (
        <div className="absolute -top-3 left-6">
          <PrimeBadge size="md" />
        </div>
      )}
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.14em] text-white/50">
          {isPrime ? "Upsell" : "Plano principal"}
        </div>
        <h3 className="mt-1 text-2xl font-semibold text-white">{plan.name}</h3>
        <p className="mt-1 text-sm text-white/60">{plan.tagline}</p>
      </div>

      <div className="mb-5">
        <div className="text-3xl font-bold text-white">{plan.priceLabel}</div>
        {isPrime && <div className="text-xs text-white/50">adicional ao plano principal</div>}
      </div>

      <ul className="mb-6 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
            <Check size={16} className={isPrime ? "mt-0.5 text-amber-300" : "mt-0.5 text-white/60"} strokeWidth={2.5} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onCta}
        disabled={disabled}
        className={cn(
          "mt-auto inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition",
          "disabled:cursor-not-allowed disabled:opacity-60",
          isPrime
            ? "bg-gradient-to-r from-amber-300 to-orange-400 text-neutral-900 hover:brightness-105"
            : "bg-white text-neutral-900 hover:bg-white/90",
        )}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
