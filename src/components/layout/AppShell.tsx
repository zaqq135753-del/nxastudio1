import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Home, Refrigerator, Camera, CalendarDays, HeartPulse, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const tabs = [
  { to: "/app",        label: "Início",    icon: Home },
  { to: "/geladeira",  label: "Geladeira", icon: Refrigerator },
  { to: "/foto",       label: "Foto",      icon: Camera },
  { to: "/planner",    label: "Planner",   icon: CalendarDays },
  { to: "/nutri",      label: "Nutri",     icon: HeartPulse },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [initial, setInitial] = useState("S");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      setAvatar((meta.avatar_url as string) ?? null);
      const name = (meta.name as string) ?? u.email ?? "S";
      setInitial(name.charAt(0).toUpperCase());
    });
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{ background: "rgba(14,11,8,0.75)", backdropFilter: "blur(14px)", borderColor: "var(--line-1)" }}>
        <div className="mx-auto flex h-14 max-w-[820px] items-center justify-between px-4">
          <Link to="/app" className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
            Sabor<em style={{ color: "var(--saffron)" }}>IA</em>
          </Link>
          <div className="flex items-center gap-2">
            <span className="chip">✨ IA Ativa</span>
            <button onClick={signOut} title="Sair" className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border" style={{ borderColor: "var(--line-2)", background: "var(--ink-800)" }}>
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-medium" style={{ color: "var(--saffron)" }}>{initial}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-4 pt-20">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{ background: "rgba(14,11,8,0.85)", backdropFilter: "blur(14px)", borderColor: "var(--line-1)" }}>
        <div className="mx-auto flex max-w-[520px] items-center justify-around px-2 py-2">
          {tabs.map((t) => {
            const active = pathname === t.to;
            const Icon = t.icon;
            return (
              <Link key={t.to} to={t.to}
                className="flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs transition-colors"
                style={{ color: active ? "var(--saffron)" : "var(--cream-400)" }}>
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
    <div className="flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--line-1)", background: "var(--ink-800)" }}>
      <div className="flex gap-1.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
      {label && <span className="text-sm" style={{ color: "var(--cream-400)" }}>{label}</span>}
    </div>
  );
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 fade-up">
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--cream-400)" }}>{subtitle}</p>
      )}
    </div>
  );
}
