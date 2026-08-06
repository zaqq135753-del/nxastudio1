import type { ReactNode } from "react";
import type { AppConfig } from "@/apps/config";

type Props = {
  app: AppConfig;
  status?: "trial" | "prime" | "base" | "locked" | "available";
  trialDaysLeft?: number;
  action?: ReactNode;
};

const STATUS_LABEL: Record<NonNullable<Props["status"]>, string> = {
  trial: "Trial ativo",
  prime: "Prime ativo",
  base: "Plano ativo",
  locked: "Bloqueado",
  available: "Disponível",
};

/**
 * Hero editorial: nome, promessa (dor→solução), status contextual.
 * Substitui o "cabeçalho + subtítulo" genérico em toda home de app.
 */
export function AppHero({ app, status, trialDaysLeft, action }: Props) {
  const trialSuffix = status === "trial" && typeof trialDaysLeft === "number"
    ? ` · ${trialDaysLeft}d restantes` : "";

  return (
    <header className="mb-6 fade-up">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-[11px] font-black uppercase text-indigo-400 tracking-wider mb-2">
            ✨ {app.name}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-neutral-950 dark:text-white drop-shadow-sm">
            {app.heroTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-100 font-bold max-w-2xl">
            {app.heroSubtitle}
          </p>
        </div>
        {status && (
          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-xs font-bold text-neutral-900 dark:text-white shadow-lg shrink-0 self-start">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            {STATUS_LABEL[status]}{trialSuffix}
          </span>
        )}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </header>
  );
}
