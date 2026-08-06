import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { LineChart, Award, TrendingUp, Sparkles, GraduationCap, Target, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/studyia/diagnostico")({
  component: DiagnosticoPage,
});

const COURSES = [
  { id: "med", name: "Medicina", cutoff: 810, area: "Ciências da Saúde" },
  { id: "dir", name: "Direito", cutoff: 750, area: "Ciências Sociais" },
  { id: "eng", name: "Engenharia de Software", cutoff: 730, area: "Exatas e Tecnologia" },
  { id: "psico", name: "Psicologia", cutoff: 720, area: "Saúde e Humanas" },
  { id: "adm", name: "Administração", cutoff: 680, area: "Negócios" },
];

export function DiagnosticoPage() {
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
  const estimatedScore = 820; // Nota TRI estimada do aluno no app

  const scoreDiff = estimatedScore - selectedCourse.cutoff;
  const isApproved = scoreDiff >= 0;
  const chancePercentage = Math.min(99, Math.max(20, Math.round(50 + scoreDiff * 1.5)));

  return (
    <AppShell appSlug="studyia">
      <ScreenHeader
        title="Diagnóstico & Simulador de Aprovação SISU"
        subtitle="Acompanhe sua nota TRI estimada e descubra sua porcentagem de chance de passar na faculdade dos sonhos!"
      />

      <div className="space-y-6">
        {/* Card Principal de Nota Estimada */}
        <div className="surface flex items-center justify-between p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Nota TRI Estimada no App</div>
            <h2 className="mt-1 text-4xl font-extrabold sm:text-5xl">{estimatedScore} / 1000</h2>
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingUp size={14} /> +60 pontos acumulados com exercícios no app
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Award size={32} />
          </div>
        </div>

        {/* SIMULADOR DE APROVAÇÃO SISU / PROUNI */}
        <div className="surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={20} className="text-indigo-500" />
            <h3 className="text-base font-extrabold">Simulador de Chance SISU / ProUni</h3>
          </div>

          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Selecione o Curso Desejado
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {COURSES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c)}
                className={`p-3 rounded-2xl border text-left transition ${
                  selectedCourse.id === c.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                    : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                <div className="text-xs font-extrabold">{c.name}</div>
                <div className="text-[10px] opacity-80">Corte: {c.cutoff} pts</div>
              </button>
            ))}
          </div>

          {/* Resultado do Simulador de Aprovação */}
          <div className={`p-5 rounded-2xl border ${
            isApproved
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Chance Estimada em {selectedCourse.name}</span>
              <span className="text-xl font-black">{chancePercentage}% Aprovado</span>
            </div>

            <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-700 ${isApproved ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${chancePercentage}%` }}
              />
            </div>

            <p className="text-xs leading-relaxed font-medium">
              {isApproved
                ? `🎉 Parabéns! Sua nota atual (${estimatedScore} pts) está ${scoreDiff} pontos acima da nota de corte estimada de ${selectedCourse.name} (${selectedCourse.cutoff} pts).`
                : `⚡ Atenção: Você está a apenas ${Math.abs(scoreDiff)} pontos da nota de corte de ${selectedCourse.name} (${selectedCourse.cutoff} pts). Faça mais 2 redações esta semana para alcançar!`}
            </p>
          </div>
        </div>

        {/* Desempenho por Áreas */}
        <div className="surface p-5">
          <div className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Radar por Área do Conhecimento</div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span>Redação (Esqueletos Coringa)</span>
                <span className="text-emerald-500">920 pts</span>
              </div>
              <div className="h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span>Matemática e Suas Tecnologias</span>
                <span className="text-indigo-500">760 pts</span>
              </div>
              <div className="h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-indigo-500 w-[76%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span>Ciências da Natureza</span>
                <span className="text-amber-500">680 pts</span>
              </div>
              <div className="h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-amber-500 w-[68%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
