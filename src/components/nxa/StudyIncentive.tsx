import { useState } from "react";
import { KeyRound, Sparkles, CheckCircle2, Trophy, Flame, Target } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const VALID_CODES = ["STUDYVIP", "ENEM1000", "STUDY1490", "APROVADO2026", "WPPVIP", "ADMIN2026", "ADMINVIP"];

export function VipCodeRedeem() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [activated, setActivated] = useState(false);

  function handleRedeem() {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return toast.error("Digite o código recebido no WhatsApp.");

    if (VALID_CODES.includes(cleanCode)) {
      setActivated(true);
      localStorage.setItem("nxa_vip_unlocked", "true");
      toast.success("Código VIP ativado com sucesso! Acesso total liberado.");
      setTimeout(() => {
        setOpen(false);
        window.location.reload();
      }, 2000);
    } else {
      toast.error("Código inválido ou expirado. Fale com nosso suporte no WhatsApp.");
    }
  }

  return (
    <>
      {/* Botão sutil de ativação */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-neutral-900 text-xs font-semibold text-indigo-300 hover:border-indigo-500/60 transition mb-6 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-amber-400" />
          <span>Comprou pelo WhatsApp? <strong className="underline text-white">Ativar com Código</strong></span>
        </div>
        <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">Resgatar</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl border-0 bg-neutral-900 p-6 text-white text-center shadow-2xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
            <KeyRound size={24} />
          </div>

          <h3 className="text-xl font-black">Resgatar Acesso do WhatsApp</h3>
          <p className="mt-1 text-xs text-neutral-400">
            Digite abaixo o código de ativação fornecido pela nossa equipe no atendimento do WhatsApp.
          </p>

          {!activated ? (
            <div className="mt-5 space-y-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: STUDYVIP"
                className="input-field text-center uppercase tracking-widest font-mono text-base"
                autoFocus
              />

              <button
                onClick={handleRedeem}
                className="btn-primary w-full py-3 text-xs font-bold"
              >
                Validar e Liberar Acesso
              </button>
            </div>
          ) : (
            <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 size={18} />
              <span>Acesso Ilimitado Liberado! Carregando…</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function StudyIncentiveTicker() {
  const messages = [
    { icon: Flame, text: "Faltam poucos meses para o ENEM! Treine 1 redação hoje.", color: "text-amber-500" },
    { icon: Target, text: "Dica de Ouro: Explicar a matéria no Caderno de Áudio fixa 80% do assunto.", color: "text-emerald-500" },
    { icon: Trophy, text: "Alunos Nota 900+ fazem pelo menos 3 simulados cronometrados por semana.", color: "text-indigo-500" },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-purple-500/20 bg-white/80 dark:bg-zinc-950/70 p-3.5 text-xs backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-[10px] font-extrabold uppercase text-purple-700 dark:text-purple-300 tracking-wider shrink-0 animate-pulse">
          <Sparkles size={12} className="text-amber-500" /> Foco Aprovado
        </div>
        <p className="text-zinc-700 dark:text-zinc-200 font-medium truncate leading-relaxed">
          {messages[currentIdx].text}
        </p>
      </div>
    </div>
  );
}
