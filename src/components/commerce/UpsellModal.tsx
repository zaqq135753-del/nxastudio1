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
    const checkoutUrl = slug === "cosmosia"
      ? "https://paylume.fans/c/nxa-estudantil"
      : "https://paylume.fans/c/nxa-studio";
    window.location.href = checkoutUrl;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[94vw] overflow-hidden rounded-3xl border border-amber-500/30 bg-neutral-950 p-0 text-white shadow-2xl backdrop-blur-2xl">
        {/* Glowing Header */}
        <div className="relative border-b border-neutral-800 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent p-6 text-left">
          <div className="mb-2 flex items-center gap-2">
            <PrimeBadge size="md" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">Oferta de Liberação Imediata</span>
          </div>
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-2xl font-extrabold text-white leading-tight">
              Acesso Ilimitado ao NXA Study
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-300 leading-relaxed font-medium">
              Libere o Corretor de Redação 900+, Caderno de Áudio Feynman e Simulados por tempo limitado.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-6">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">Ferramentas Liberadas no seu Plano</div>
          <ul className="space-y-2.5">
            {p.prime.features.slice(0, 5).map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-xs font-semibold text-neutral-200">
                <Check size={16} className="mt-0.5 text-emerald-400 shrink-0" strokeWidth={3} />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-neutral-900 p-4 border border-neutral-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Investimento no ENEM</span>
              <span className="text-xs text-emerald-400 font-extrabold">Desconto de 50% Aplicado</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-400">R$ 14,90</span>
              <span className="text-[10px] text-neutral-400 block">/mês no PIX</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-neutral-800 p-6 bg-neutral-900/50">
          <button
            type="button"
            onClick={handleGoSharkbot}
            disabled={busy}
            className="btn-primary flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-sm font-black text-white transition transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-950/50 border border-emerald-400/30"
          >
            <Sparkles size={20} className="animate-spin text-amber-300" />
            GARANTIR ACESSO POR R$ 14,90
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={busy}
            className="py-2 w-full text-center text-xs font-medium text-neutral-400 hover:text-white transition"
          >
            Continuar usando a versão grátis
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
