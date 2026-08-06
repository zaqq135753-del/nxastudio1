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

  function handleGoSharkbot() {
    // Redireciona direto para o checkout da Sharkbot de R$ 14,90 / R$ 29,90
    const checkoutUrl = slug === "cosmosia"
      ? "https://paylume.fans/c/nxa-estudantil"
      : "https://paylume.fans/c/nxa-studio";
    window.location.href = checkoutUrl;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] overflow-hidden rounded-3xl border-0 bg-neutral-900 p-0 text-white shadow-2xl">
        <div className="relative border-b border-white/10 bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-5 text-left">
          <div className="mb-2 flex items-center gap-2">
            <PrimeBadge size="md" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Oferta de Liberação Acesso Total</span>
          </div>
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl sm:text-2xl font-black text-white">
              Garantir {p.prime.name}?
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-300 leading-relaxed">
              {p.primeCopy}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">O que você desbloqueia agora</div>
          <ul className="space-y-2">
            {p.prime.features.slice(0, 6).map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-neutral-200">
                <Check size={16} className="mt-0.5 text-amber-400 shrink-0" strokeWidth={2.5} />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-neutral-800/90 p-4 border border-neutral-700/60">
            <div className="text-xs font-semibold text-neutral-300">Acesso Total NXA</div>
            <div className="text-xl font-extrabold text-amber-400">{p.prime.priceLabel}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-neutral-800 p-5">
          <button
            type="button"
            onClick={handleGoSharkbot}
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-sm font-extrabold text-neutral-950 transition hover:brightness-110 shadow-lg shadow-orange-950/40 active:scale-95"
          >
            <Sparkles size={18} /> Assinar e Liberar Acesso Agora
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={busy}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition"
          >
            Continuar sem assinar agora
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
