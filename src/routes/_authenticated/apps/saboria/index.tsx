import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { RealtimeCallButton } from "@/components/voice/RealtimeCallButton";
import { Refrigerator, Camera, CalendarDays, HeartPulse, Sparkles, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemePicker, useInitTheme } from "@/components/ThemePicker";
import coverImg from "@/assets/cover-saboria.jpg";

export const Route = createFileRoute("/_authenticated/apps/saboria/")({
  component: Dashboard,
});

const quickAccess = [
  { to: "/apps/saboria/agora" as const,     icon: Sparkles,     title: "O que faço agora?", desc: "3 ideias em segundos" },
  { to: "/apps/saboria/geladeira" as const, icon: Refrigerator, title: "Geladeira IA",      desc: "Do que tem em casa" },
  { to: "/apps/saboria/foto" as const,      icon: Camera,       title: "Foto → Receita",    desc: "Identifica qualquer prato" },
  { to: "/apps/saboria/planner" as const,   icon: CalendarDays, title: "Planner semanal",   desc: "7 dias na hora" },
  { to: "/apps/saboria/nutri" as const,     icon: HeartPulse,   title: "Nutri virtual",     desc: "Chat 24h com IA" },
];

function Dashboard() {
  useInitTheme();
  const [name, setName] = useState("");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: p } = await supabase.from("profiles").select("display_name, onboarded").eq("id", u.user!.id).maybeSingle();
      setName(p?.display_name ?? u.user?.email?.split("@")[0] ?? "");
      setNeedsOnboarding(!p?.onboarded);
    })();
  }, []);

  const greeting = greetingForHour(new Date().getHours());

  return (
    <AppShell>
      <div className="mb-4 flex items-start justify-between gap-4">
        <ScreenHeader
          title={`${greeting}${name ? `, ${name.split(" ")[0]}` : ""}.`}
          subtitle="Sua cozinha, seu ritmo. O que a gente prepara hoje?"
        />
      <div className="mb-4 flex justify-center"><RealtimeCallButton slug="saboria" /></div>
        <div className="mt-2 shrink-0"><ThemePicker /></div>
      </div>

      {needsOnboarding && (
        <Link to="/apps/saboria/onboarding" className="hero-animated fade-up mb-6 block p-6">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/85">
            <Sparkles size={14} className="spark" /> Onboarding · 3 min
          </div>
          <div className="mt-2 text-2xl font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Deixa a IA aprender o seu paladar
          </div>
          <div className="mt-1 max-w-md text-sm text-white/85">
            Depois disso, toda receita, plano e sugestão passa a soar como sua.
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur">
            Começar agora <ArrowRight size={14} />
          </div>
        </Link>
      )}

      <section className="stagger mb-8 grid grid-cols-2 gap-3">
        {quickAccess.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="tile-hero tile-cover group"
            style={{ ["--tile-img" as string]: `url(${coverImg})` } as CSSProperties}
          >
            <div className="flex items-start justify-between">
              <div className="tile-icon-wrap"><q.icon size={20} /></div>
              <ChevronRight size={16} className="tile-arrow" />
            </div>
            <div className="mt-2">
              <div className="tile-title">{q.title}</div>
              <div className="tile-desc">{q.desc}</div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mb-8 fade-up">
        <div className="edition-tag mb-3">Ideias pro fim do dia</div>
        <div className="surface p-6">
          <div className="text-xl sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Pergunte à Nutri, gere um plano ou descubra o que fazer com o que sobrou.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/apps/saboria/nutri" className="chip chip-neutral">💬 Falar com a Nutri</Link>
            <Link to="/apps/saboria/geladeira" className="chip chip-neutral">🧊 O que fazer hoje</Link>
            <Link to="/apps/saboria/planner" className="chip chip-neutral">📅 Plano da semana</Link>
            <Link to="/apps/saboria/receitas" className="chip chip-neutral"><BookOpen size={12} className="mr-1 inline" />Minhas receitas</Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function greetingForHour(h: number) {
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
