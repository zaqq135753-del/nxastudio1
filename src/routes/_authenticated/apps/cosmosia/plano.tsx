import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { Target, CheckCircle } from "lucide-react";

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
  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Plano Reta Final ENEM 2026"
        subtitle="Cronograma prático focado nos 20% do conteúdo que geram 80% das questões da prova."
      />

      <div className="space-y-4">
        {PLAN_WEEKS.map((p, idx) => (
          <div key={idx} className="surface rounded-2xl border border-white/10 p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Target size={14} /> {p.week}
            </div>
            <h3 className="mt-1 text-base font-bold text-white">{p.focus}</h3>

            <ul className="mt-3 space-y-2 text-xs text-white/80">
              {p.tasks.map((t, tIdx) => (
                <li key={tIdx} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-indigo-400 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
