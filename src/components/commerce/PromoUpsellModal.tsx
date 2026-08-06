import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, Timer, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutUrl?: string;
};

export function PromoUpsellModal({ open, onOpenChange, checkoutUrl = "https://paylume.fans/c/nxa-studio" }: Props) {
  const [timeLeft, setTimeLeft] = useState(599); // 09:59 mins

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  function handleBuy() {
    window.location.href = checkoutUrl;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-0 bg-neutral-900 p-0 text-white shadow-2xl">
        {/* Banner de Urgência */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 text-center text-xs font-bold uppercase tracking-wider text-neutral-950 flex items-center justify-center gap-2">
          <Timer size={16} className="animate-bounce" />
          <span>Oferta Exclusiva Expira em: <span className="font-mono text-sm underline">{formattedTime}</span></span>
        </div>

        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles size={28} />
          </div>

          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
            🎉 Recompensa de Desempenho Desbloqueada
          </span>

          <h3 className="mt-3 text-2xl font-black text-white leading-tight">
            Garanta o NXA Estudantil com <span className="text-amber-400 underline">50% OFF</span>
          </h3>

          <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
            Você acabou de experimentar o poder da nossa IA. Assine agora e tenha acesso **ILIMITADO** ao Corretor de Redação, Esqueletos Coringa, Caderno de Áudio e Simulados!
          </p>

          {/* Comparativo de Preço */}
          <div className="my-5 rounded-2xl bg-neutral-800/80 p-4 border border-neutral-700/50 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] text-neutral-400 line-through block">De R$ 45,90/mês</span>
              <span className="text-xs text-emerald-400 font-bold">Por apenas</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-white">R$ 29,90</span>
              <span className="text-[10px] text-neutral-400 block">/mês no PIX ou Cartão</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2">
            <button
              onClick={handleBuy}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
            >
              Garantir Acesso Ilimitado por R$ 29,90 <ArrowRight size={18} />
            </button>

            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-2 text-xs text-neutral-400 hover:text-white transition"
            >
              Não quero desconto agora, continuar com versão grátis
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-neutral-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Garantia incondicional de 7 dias · Liberação instantânea</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
