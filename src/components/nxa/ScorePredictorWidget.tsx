import React from "react";
import { Sparkles, Trophy, ArrowRight } from "lucide-react";

export function ScorePredictorWidget() {
  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden p-[1px] bg-gradient-to-r from-purple-500/40 via-indigo-500/40 to-cyan-500/40 shadow-2xl shadow-purple-950/40 fade-up">
      <div className="rounded-[15px] bg-zinc-950/80 backdrop-blur-xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Medidor de Nota Circular & Informações */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-500 stroke-current"
                strokeDasharray="88, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-extrabold text-xl text-white">880</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-white">Nota Estimada de Redação</h3>
              <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                <Trophy size={11} /> Nível Medicina
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Sua nota atual supera 92% dos alunos. Envie 1 redação hoje para ultrapassar a barreira dos 920+!
            </p>
          </div>
        </div>

        {/* Botão CTA de Ação Rápida */}
        <button
          onClick={() => {
            sessionStorage.setItem("nxa:agent:seed", "Simule a minha nota atual do ENEM com base nas minhas últimas redações e me dê um diagnóstico por competência.");
            window.location.href = "/agente";
          }}
          className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 flex-shrink-0 group"
        >
          <Sparkles size={16} className="text-purple-200 group-hover:rotate-12 transition-transform" />
          Simular Nota com IA
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
}
