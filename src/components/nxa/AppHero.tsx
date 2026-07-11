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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="edition-tag mb-2">{app.name}</div>
          <h1 className="truncate text-[26px] font-black tracking-tight sm:text-[32px]">
            {app.heroTitle}
          </h1>
          <p className="mt-1.5 text-[15px] leading-snug" style={{ color: "var(--muted-foreground)" }}>
            {app.heroSubtitle}
          </p>
        </div>
        {status && (
          <span className="chip chip-neutral shrink-0 whitespace-nowrap">
            {STATUS_LABEL[status]}{trialSuffix}
          </span>
        )}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </header>
  );
}
