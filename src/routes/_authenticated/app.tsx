import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { Refrigerator, Camera, CalendarDays, HeartPulse, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app")({
  component: Dashboard,
});

const quickAccess = [
  { to: "/geladeira" as const, icon: Refrigerator, title: "Geladeira IA", desc: "Do que tem em casa", accent: "var(--saffron)" },
  { to: "/foto" as const,      icon: Camera,       title: "Foto → Receita", desc: "Identifica qualquer prato", accent: "var(--tomato)" },
  { to: "/planner" as const,   icon: CalendarDays, title: "Planner semanal", desc: "7 dias na hora", accent: "var(--matcha)" },
  { to: "/nutri" as const,     icon: HeartPulse,   title: "Nutri virtual", desc: "Chat 24h com IA", accent: "var(--plum)" },
];

function Dashboard() {
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
      <ScreenHeader
        title={`${greeting}${name ? `, ${name.split(" ")[0]}` : ""}.`}
        subtitle="Sua cozinha, seu ritmo. O que a gente prepara hoje?"
      />

      {needsOnboarding && (
        <Link to="/onboarding" className="mesh-hero fade-up mb-6 block rounded-2xl p-1">
          <div className="rounded-[14px] p-5" style={{ background: "linear-gradient(180deg, rgba(14,11,8,0.5), rgba(14,11,8,0.85))" }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--cream-200)" }}>
              <Sparkles size={14} style={{ color: "var(--saffron)" }} /> ONBOARDING · 3 MIN
            </div>
            <div className="mt-2 text-xl" style={{ fontFamily: "var(--font-display)", color: "var(--cream-50)" }}>
              Deixa a IA aprender o seu paladar
            </div>
            <div className="mt-1 text-sm" style={{ color: "var(--cream-300)" }}>
              Depois disso toda receita, plano e sugestão passa a soar como sua.
            </div>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--saffron)" }}>
              Começar agora <ArrowRight size={14} />
            </div>
          </div>
        </Link>
      )}

      <section className="mb-8 grid grid-cols-2 gap-3">
        {quickAccess.map((q) => (
          <Link key={q.to} to={q.to} className="card-editorial p-5">
            <q.icon size={22} style={{ color: q.accent }} />
            <div className="mt-4 text-lg" style={{ fontFamily: "var(--font-display)" }}>{q.title}</div>
            <div className="mt-1 text-xs" style={{ color: "var(--cream-400)" }}>{q.desc}</div>
          </Link>
        ))}
      </section>

      <section className="mb-8">
        <div className="edition-tag mb-3">Ideias pro fim do dia</div>
        <div className="surface p-6">
          <div className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Pergunte à Nutri, gere um plano ou descubra o que fazer com o que sobrou.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/nutri" className="chip chip-neutral">💬 Falar com a Nutri</Link>
            <Link to="/geladeira" className="chip chip-neutral">🧊 O que fazer hoje</Link>
            <Link to="/planner" className="chip chip-neutral">📅 Plano da semana</Link>
            <Link to="/receitas" className="chip chip-neutral"><BookOpen size={12} className="mr-1 inline" />Minhas receitas</Link>
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
