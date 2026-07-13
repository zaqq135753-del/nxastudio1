import { useRouterState } from "@tanstack/react-router";
import { APPS } from "@/apps/registry";
import { Loader2 } from "lucide-react";

export function AppLoadingScreen() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const app = APPS.find((a) => pathname.startsWith(a.route));
  const Icon = app?.icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-card shadow-xl">
          {Icon ? (
            <Icon className="h-9 w-9 text-primary" strokeWidth={1.6} />
          ) : (
            <Loader2 className="h-9 w-9 animate-spin text-primary" />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-lg font-serif italic text-foreground">
          {app?.name ?? "Carregando"}
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {app?.tagline ?? "Preparando seu espaço"}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Abrindo experiência…</span>
      </div>
    </div>
  );
}

export default AppLoadingScreen;
