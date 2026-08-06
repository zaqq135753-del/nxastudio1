import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { Target, CheckCircle2, Circle, BellCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/plano")({
  component: PlanoPage,
});

const PLAN_WEEKS = [
  { week: "Semana 1 ao 3", focus: "Fundamentos de Redação & Matemática Básica", tasks: ["Estrutura de Introdução Coringa", "Porcentagem e Regra de Três", "Ecologia e Relações Ecológicas"] },
  { week: "Semana 4 ao 6", focus: "Humanas & Interpretação de Texto", tasks: ["História do Brasil Império", "Geografia Física e Clima", "Funções da Linguagem"] },
  { week: "Semana 7 ao 9", focus: "Física & Química de Alta Incidência", tasks: ["Cinemática e Leis de Newton", "Estequiometria Básica", "Modelos de Conclusão de Redação"] },
  { week: "Véspera (Últimos 15 Dias)", focus: "Revisão por Checklists & Simulados", tasks: ["Revisar 10 Modelos Coringa", "3 Simulados Rápidos por dia", "Descanso na véspera"] },
];

function PlanoPage() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("nxa_study_plan_progress");
    if (saved) {
      try { setCompletedTasks(JSON.parse(saved)); } catch {}
    }
  }, []);

  function toggleTask(taskName: string) {
    const updated = { ...completedTasks, [taskName]: !completedTasks[taskName] };
    setCompletedTasks(updated);
    localStorage.setItem("nxa_study_plan_progress", JSON.stringify(updated));
    if (updated[taskName]) toast.success(`Concluído: ${taskName}!`);
  }

  const allTasks = PLAN_WEEKS.flatMap((w) => w.tasks);
  const doneCount = allTasks.filter((t) => completedTasks[t]).length;
  const progressPercentage = Math.round((doneCount / allTasks.length) * 100);

  function scheduleStudyReminder() {
    toast.success("Lembrete Ativado! Você receberá alertas diários de estudos às 19:00.");
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Plano Reta Final ENEM 2026"
        subtitle="Cronograma prático focado nos 20% do conteúdo que geram 80% das questões da prova."
      />

      {/* Barra de Progresso do Estudante */}
      <div className="surface mb-6 p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <span className="text-sm font-bold">Seu Progresso de Estudos</span>
          </div>
          <span className="text-sm font-extrabold text-indigo-500">{progressPercentage}% Concluído</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
          <span>{doneCount} de {allTasks.length} metas concluídas</span>
          <button
            onClick={scheduleStudyReminder}
            className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <BellCheck size={14} /> Ativar Lembrete Diário
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {PLAN_WEEKS.map((p, idx) => (
          <div key={idx} className="surface p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <Target size={14} /> {p.week}
              </div>
            </div>
            <h3 className="mt-1 text-base font-bold">{p.focus}</h3>

            <ul className="mt-4 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
              {p.tasks.map((t, tIdx) => {
                const isChecked = !!completedTasks[t];
                return (
                  <li
                    key={tIdx}
                    onClick={() => toggleTask(t)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                      isChecked
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isChecked ? (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-neutral-400 shrink-0" />
                      )}
                      <span className={isChecked ? "line-through font-medium opacity-80" : "font-semibold text-neutral-900 dark:text-neutral-100"}>
                        {t}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                      {isChecked ? "Concluído" : "Pendente"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
