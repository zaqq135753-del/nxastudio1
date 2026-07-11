import { Link } from "@tanstack/react-router";
import { BookOpen, FolderOpen, Lock } from "lucide-react";
import type { AppConfig } from "@/apps/config";

type Props = {
  app: AppConfig;
  isPrime: boolean;
};

/**
 * Painéis de Memória e Mídia (Onda E).
 * Estados vazios por enquanto — os dados reais virão em Onda F/G.
 */
export function MediaMemoryPanel({ app, isPrime }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 fade-up">
      <div className="surface p-5">
        <div className="flex items-center gap-2 edition-tag mb-2">
          <BookOpen size={12} /> Memória
        </div>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {app.emptyStates.memory}
        </p>
      </div>
      <div className="surface p-5">
        <div className="flex items-center justify-between edition-tag mb-2">
          <span className="inline-flex items-center gap-2"><FolderOpen size={12} /> Mídia</span>
          {!isPrime && <Lock size={11} style={{ color: "var(--n-500)" }} />}
        </div>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {app.emptyStates.media}
        </p>
        {!isPrime && (
          <Link
            to="/assinar/$slug"
            params={{ slug: app.slug }}
            className="mt-3 inline-flex text-xs font-medium underline-offset-2 hover:underline"
          >
            Ver planos →
          </Link>
        )}
      </div>
    </div>
  );
}
