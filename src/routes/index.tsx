import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { Refrigerator, Camera, CalendarDays, HeartPulse } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const stats = [
  { value: "2.4k+", label: "Receitas geradas" },
  { value: "156", label: "Fotos analisadas" },
  { value: "89", label: "Planos criados" },
];

const quickAccess = [
  {
    to: "/geladeira" as const,
    icon: Refrigerator,
    title: "Geladeira IA",
    desc: "Receitas com o que você tem",
    emoji: "🧊",
  },
  {
    to: "/foto" as const,
    icon: Camera,
    title: "Foto → Receita",
    desc: "Identifique pratos por foto",
    emoji: "📸",
  },
  {
    to: "/planner" as const,
    icon: CalendarDays,
    title: "Meal Planner",
    desc: "Plano semanal completo",
    emoji: "📅",
  },
  {
    to: "/nutri" as const,
    icon: HeartPulse,
    title: "Nutricionista IA",
    desc: "Macros e substituições",
    emoji: "🏥",
  },
];

const popular = [
  { emoji: "🍝", name: "Macarrão à Bolonhesa", time: "30 min", servings: "4 porções", desc: "Clássico italiano perfeito para o almoço em família." },
  { emoji: "🥗", name: "Salada Caesar", time: "15 min", servings: "2 porções", desc: "Leve, crocante e cheia de sabor com molho especial." },
  { emoji: "🍲", name: "Feijoada Light", time: "1h 20min", servings: "6 porções", desc: "Versão mais leve do prato brasileiro tradicional." },
  { emoji: "🍳", name: "Omelete de Espinafre", time: "10 min", servings: "1 porção", desc: "Café da manhã proteico e prático." },
  { emoji: "🥘", name: "Risoto de Cogumelos", time: "35 min", servings: "3 porções", desc: "Cremoso e sofisticado, ideal pro jantar." },
];

function HomePage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="fade-up py-6 text-center sm:py-10">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Seu Chef Pessoal com <span style={{ color: "var(--brand)" }}>IA</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base" style={{ color: "var(--text-2)" }}>
          Receitas inteligentes a partir do que você tem em casa. Sem desperdício, sem complicação.
        </p>
      </section>

      {/* Stats */}
      <section className="mb-8 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass p-4 text-center">
            <div className="text-xl font-bold sm:text-2xl" style={{ color: "var(--brand)" }}>
              {s.value}
            </div>
            <div className="mt-1 text-[11px] leading-tight sm:text-xs" style={{ color: "var(--text-2)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* Quick access */}
      <section className="mb-8 grid grid-cols-2 gap-3">
        {quickAccess.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="glass p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="text-3xl">{q.emoji}</div>
            <div className="mt-3 font-semibold">{q.title}</div>
            <div className="mt-1 text-xs" style={{ color: "var(--text-2)" }}>
              {q.desc}
            </div>
          </Link>
        ))}
      </section>

      {/* Popular */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Receitas Populares</h2>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {popular.map((r) => (
            <div
              key={r.name}
              className="glass w-[260px] shrink-0 snap-start overflow-hidden"
            >
              <div
                className="flex h-[180px] items-center justify-center text-6xl"
                style={{ background: "linear-gradient(135deg, var(--bg-4), var(--bg-2))" }}
              >
                {r.emoji}
              </div>
              <div className="p-4">
                <div className="font-semibold">{r.name}</div>
                <div className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
                  ⏱ {r.time} · 🍽 {r.servings}
                </div>
                <p className="mt-2 text-xs" style={{ color: "var(--text-2)" }}>
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
