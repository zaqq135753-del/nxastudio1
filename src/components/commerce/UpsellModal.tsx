import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Sparkles } from "lucide-react";
import { getPricing } from "@/apps/pricing";
import { PrimeBadge } from "./PrimeBadge";

type Props = {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onSkip: () => void;
  busy?: boolean;
};

export function UpsellModal({ slug, open, onOpenChange, onConfirm, onSkip, busy }: Props) {
  const p = getPricing(slug);
  if (!p) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden border-white/10 bg-neutral-950/95 p-0 text-white backdrop-blur-xl">
        <div className="relative border-b border-white/10 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(251,191,36,0.18),transparent_60%)] p-6">
          <div className="mb-3 flex items-center gap-2">
            <PrimeBadge size="md" />
            <span className="text-xs text-white/50">Adicional ao plano principal</span>
          </div>
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-2xl font-semibold">
              Adicionar {p.prime.name}?
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {p.primeCopy}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 p-6">
          <div className="text-xs uppercase tracking-wider text-white/50">Você desbloqueia</div>
          <ul className="space-y-2">
            {p.prime.features.slice(0, 6).map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-white/85">
                <Check size={16} className="mt-0.5 text-amber-300" strokeWidth={2.5} />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-baseline justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="text-sm text-white/70">Adicional Prime</div>
            <div className="text-lg font-semibold text-white">{p.prime.priceLabel}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 p-6 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-5 text-sm font-semibold text-neutral-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles size={16} /> Adicionar Prime
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={busy}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/15 bg-transparent px-5 text-sm font-medium text-white/80 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continuar sem Prime
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
