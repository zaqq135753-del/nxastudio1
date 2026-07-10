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
    <div className="min-h-screen pb-28">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b glass"
        style={{ borderRadius: 0, borderColor: "var(--line-1)" }}>
        <div className="mx-auto flex h-14 max-w-[820px] items-center justify-between px-5">
          <Link to="/app" className="text-[17px] font-bold tracking-tight">
            Sabor<span style={{ color: "var(--c-orange)" }}>IA</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="chip">✨ IA Ativa</span>
            <button onClick={signOut} title="Sair" className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
              style={{ background: "var(--n-100)" }}>
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold" style={{ color: "var(--c-orange)" }}>{initial}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-4 pt-20">{children}</main>

      {/* Bottom nav — floating pill */}
      <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
        <div className="glass flex items-center gap-1 rounded-full px-2 py-1.5"
          style={{ boxShadow: "var(--shadow-elev)" }}>
          {tabs.map((t) => {
            const active = pathname === t.to;
            const Icon = t.icon;
            return (
              <Link key={t.to} to={t.to}
                className="flex flex-col items-center justify-center rounded-full px-3.5 py-2 text-[10px] font-medium transition-all"
                style={{
                  color: active ? "#fff" : "var(--n-500)",
                  background: active ? "var(--c-orange)" : "transparent",
                }}>
                <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
                <span className="mt-0.5">{t.label}</span>
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
    <div className="flex items-center gap-3 rounded-2xl p-4 surface">
      <div className="flex gap-1.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
      {label && <span className="text-sm" style={{ color: "var(--n-500)" }}>{label}</span>}
    </div>
  );
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 fade-up">
      <h1 className="text-[28px] sm:text-4xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-1.5 text-[15px] sm:text-base" style={{ color: "var(--n-500)" }}>{subtitle}</p>
      )}
    </div>
  );
}
