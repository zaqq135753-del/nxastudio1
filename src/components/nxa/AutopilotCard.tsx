import { Link } from "@tanstack/react-router";
import { Sparkles, Lock, Zap } from "lucide-react";
import type { AppConfig } from "@/apps/config";

type Props = {
  app: AppConfig;
  isPrime: boolean;
  /** Se ativo, mostramos "Ativado" ao invés do CTA. Stub por enquanto. */
  active?: boolean;
};

/**
 * Cartão de autopilot — automação Prime por app.
 * Stub: ligar/desligar salva em localStorage; sem backend ainda.
 */
export function AutopilotCard({ app, isPrime, active = false }: Props) {
  const { name, desc } = app.autopilot;
  return (
    <div className="surface p-5 fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="edition-tag mb-1 inline-flex items-center gap-1">
            <Zap size={11} /> Autopilot
          </div>
          <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
            {desc}
          </p>
        </div>
        <span className="chip chip-neutral inline-flex items-center gap-1 shrink-0">
          <Sparkles size={11} /> Prime
        </span>
      </div>
      <div className="mt-4">
        {isPrime ? (
          <button
            type="button"
            className="press inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
            style={{ background: "var(--foreground)", color: "var(--card)" }}
          >
            {active ? "Ativado" : "Ativar automação"}
          </button>
        ) : (
          <Link
            to="/assinar/$slug"
            params={{ slug: app.slug }}
            className="press inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
            style={{ background: "var(--n-100)", color: "var(--foreground)" }}
          >
            <Lock size={13} /> Desbloquear com Prime
          </Link>
        )}
      </div>
    </div>
  );
}
