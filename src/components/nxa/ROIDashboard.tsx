import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getROIDashboard } from "@/lib/roi.functions";
import { Clock, DollarSign, Zap, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ROIDashboard() {
  const load = useServerFn(getROIDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["roi-dashboard"],
    queryFn: () => load(),
    staleTime: 300_000, // 5 min
  });

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse surface h-24 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!data || data.tasksAutomated === 0) {
    return (
      <div className="surface p-6 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <TrendingUp className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold">Seu Dashboard de Impacto</h3>
        <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">
          Comece a usar os apps da NXA para ver quanto tempo e dinheiro você está economizando com IA.
        </p>
      </div>
    );
  }

  const items = [
    {
      label: "Tempo economizado",
      value: `${data.timeSavedHours}h`,
      icon: Clock,
      hint: "equivalente a dias úteis",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "ROI Financeiro",
      value: `R$ ${data.moneySavedBrl}`,
      icon: DollarSign,
      hint: "economia em serviços/tempo",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      label: "Tarefas Automadas",
      value: data.tasksAutomated,
      icon: Zap,
      hint: "ações processadas por IA",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      label: "Ganho de Eficiência",
      value: `${data.efficiencyGainPct}%`,
      icon: TrendingUp,
      hint: "vs. processos manuais",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="surface p-5 hover-lift transition-all">
            <div className="flex items-start justify-between">
              <div className={cn("rounded-xl p-2", item.bg)}>
                <item.icon className={cn("h-4 w-4", item.color)} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight">{item.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mt-1">
                {item.label}
              </div>
              <div className="text-[10px] text-muted-foreground/70 mt-0.5 italic">
                {item.hint}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 rounded-2xl bg-primary/5 border border-primary/10 p-3 text-[10px] text-primary/80">
        <Info className="h-3 w-3 shrink-0" />
        Estimativa baseada em benchmarks de mercado para economia de tempo via IA Generativa (NXA Engine v2).
      </div>
    </div>
  );
}
