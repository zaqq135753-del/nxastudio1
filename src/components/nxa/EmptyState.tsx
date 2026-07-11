import type { ReactNode } from "react";

type Props = {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

/**
 * Estado vazio humano, no lugar de "Nenhum dado encontrado".
 * Usa copy de src/apps/config.ts (emptyStates.*).
 */
export function EmptyState({ emoji = "✨", title, description, action }: Props) {
  return (
    <div className="surface p-8 text-center fade-up">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
        style={{ background: "var(--n-100)" }}>
        {emoji}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: "var(--muted-foreground)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
