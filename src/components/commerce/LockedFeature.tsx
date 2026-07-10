import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getPricing } from "@/apps/pricing";
import { PrimeBadge } from "./PrimeBadge";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  isPrime: boolean;                 // true = user has Prime, feature liberado
  feature?: string;                 // ex.: "Planner semanal"
  children: ReactNode;              // conteúdo real (botão / seção)
  variant?: "block" | "inline";     // block = cobre o filho com blur, inline = envolve botão
  className?: string;
};

export function LockedFeature({ slug, isPrime, feature, children, variant = "block", className }: Props) {
  const [open, setOpen] = useState(false);
  const p = getPricing(slug);

  if (isPrime) return <>{children}</>;

  if (variant === "inline") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-400/10",
            className,
          )}
        >
          <Lock size={12} /> {feature ?? "Prime"} <PrimeBadge className="!border-transparent !bg-transparent !px-0 !py-0" />
        </button>
        <UpgradeDialog open={open} setOpen={setOpen} slug={slug} feature={feature} />
      </>
    );
  }

  return (
    <>
      <div className={cn("relative", className)}>
        <div aria-hidden className="pointer-events-none select-none opacity-40 blur-[2px]">
          {children}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-neutral-950/60 backdrop-blur-sm transition hover:bg-neutral-950/70"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
            <Lock size={12} /> {feature ?? "Recurso Prime"}
          </span>
          <span className="max-w-[260px] text-center text-xs text-white/70">
            Faz parte do <b>{p?.prime.name ?? "Prime"}</b>. Toque para desbloquear.
          </span>
        </button>
      </div>
      <UpgradeDialog open={open} setOpen={setOpen} slug={slug} feature={feature} />
    </>
  );
}

function UpgradeDialog({
  open,
  setOpen,
  slug,
  feature,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  slug: string;
  feature?: string;
}) {
  const p = getPricing(slug);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border-white/10 bg-neutral-950/95 text-white backdrop-blur-xl">
        <DialogHeader>
          <div className="mb-2"><PrimeBadge size="md" /></div>
          <DialogTitle className="text-xl">
            {feature ? `${feature} está no ${p?.prime.name ?? "Prime"}` : `Recurso ${p?.prime.name ?? "Prime"}`}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {p?.primeCopy ?? "Desbloqueie automação, voz, análise por imagem, mídia e histórico avançado."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex items-baseline justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-sm text-white/70">Adicionar {p?.prime.name}</div>
          <div className="text-base font-semibold">{p?.prime.priceLabel}</div>
        </div>
        <Link
          to="/assinar/$slug"
          params={{ slug }}
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-5 text-sm font-semibold text-neutral-900 transition hover:brightness-105"
        >
          <Sparkles size={16} /> Ver planos do {p?.base.name}
          <ArrowRight size={16} />
        </Link>
      </DialogContent>
    </Dialog>
  );
}
