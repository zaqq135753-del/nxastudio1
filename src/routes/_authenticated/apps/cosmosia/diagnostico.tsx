import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { LineChart, Award, TrendingUp, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/diagnostico")({
  component: DiagnosticoPage,
});

function DiagnosticoPage() {
  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Diagnóstico de Desempenho ENEM"
        subtitle="Acompanhe sua nota estimada e veja os pontos fracos que você precisa ajustar."
      />

      <div className="space-y-4">
        <div className="surface flex items-center justify-between p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Nota Estimada Atual</div>
            <h2 className="mt-1 text-4xl font-extrabold sm:text-5xl">820 / 1000</h2>
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp size={14} /> +60 pontos nas últimas 2 semanas
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            <Award size={32} />
          </div>
        </div>

        <div className="surface p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">Status por Área do Conhecimento</div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Redação (Modelos Coringa)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">920 pts</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Matemática e Suas Tecnologias</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">760 pts</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-indigo-500 w-[76%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Ciências da Natureza</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">680 pts</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-amber-500 w-[68%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
