import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, Refrigerator, Camera, CalendarDays, HeartPulse } from "lucide-react";

const tabs = [
  { to: "/", label: "Início", icon: Home },
  { to: "/geladeira", label: "Geladeira", icon: Refrigerator },
  { to: "/foto", label: "Foto", icon: Camera },
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/nutri", label: "Nutri", icon: HeartPulse },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen pb-24">
      {/* Top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{
          background: "rgba(10, 12, 20, 0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--line-1)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-[800px] items-center justify-between px-4">
          <Link to="/" className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            🍳 Sabor<span style={{ color: "var(--brand)" }}>IA</span>
          </Link>
          <span className="chip" style={{ pointerEvents: "none" }}>
            ✨ IA Ativa
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-4 pt-20">{children}</main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          background: "rgba(10, 12, 20, 0.9)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--line-1)",
        }}
      >
        <div className="mx-auto flex max-w-[500px] items-center justify-around px-2 py-2">
          {tabs.map((t) => {
            const active = pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs transition-colors"
                style={{
                  color: active ? "var(--brand)" : "var(--text-2)",
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span style={{ fontWeight: active ? 600 : 500 }}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function TypingIndicator({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--line-1)", background: "var(--bg-2)" }}>
      <div className="flex gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      {label && <span className="text-sm" style={{ color: "var(--text-2)" }}>{label}</span>}
    </div>
  );
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 fade-up">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-2)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
