import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

/**
 * AIResult — showcase card premium para respostas de IA.
 * Usar em todo output relevante dos apps (receita, plano, análise, roteiro…).
 */
export function AIResult({
  title,
  badge = "Gerado por IA",
  icon,
  children,
  actions,
  tone = "warm",
}: {
  title?: string;
  badge?: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  tone?: "warm" | "cool" | "gold";
}) {
  return (
    <div className={`ai-result ${tone === "cool" ? "glass-card-cool" : tone === "gold" ? "" : ""}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl grid place-items-center shrink-0"
               style={{ background: "var(--grad-sunset)" }}>
            {icon ?? <Sparkles className="w-5 h-5 text-white" />}
          </div>
          <div className="min-w-0">
            <span className="ai-badge">{badge}</span>
            {title && <h3 className="mt-1 text-lg font-semibold truncate">{title}</h3>}
          </div>
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function StatCard({
  label, value, hint, icon,
}: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <span className="stat-label">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function AuroraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <span className="aurora-orb aurora-orb-1" />
      <span className="aurora-orb aurora-orb-2" />
      <span className="aurora-orb aurora-orb-3" />
    </div>
  );
}
