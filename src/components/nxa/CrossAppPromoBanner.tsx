import { Sparkles, ArrowRight, ChefHat, Dumbbell, Wallet, Languages, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";

const OTHER_APPS = [
  { slug: "saboria", name: "NXA Chef", desc: "Receitas de chef por foto", icon: ChefHat, tag: "50% OFF", bg: "bg-amber-950/40 border-amber-500/40 text-amber-300" },
  { slug: "fitia", name: "NXA Fit", desc: "Treinos e dieta com IA", icon: Dumbbell, tag: "R$ 14,90", bg: "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" },
  { slug: "granaia", name: "NXA Grana", desc: "Gestão financeira inteligente", icon: Wallet, tag: "VIP", bg: "bg-indigo-950/40 border-indigo-500/40 text-indigo-300" },
  { slug: "fluencyia", name: "NXA Fluency", desc: "Inglês conversacional 24h", icon: Languages, tag: "Bônus", bg: "bg-purple-950/40 border-purple-500/40 text-purple-300" },
];

export function CrossAppPromoBanner({ currentSlug }: { currentSlug: string }) {
  const promos = OTHER_APPS.filter((a) => a.slug !== currentSlug);

  return (
    <div className="mb-6 fade-up">
      {/* Alerta de Promoção com Efeito Glow Pulsante */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
          <Tag size={14} className="text-amber-500 animate-pulse" />
          <span>Oferta Exclusiva para Alunos NXA</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
          Desconto Liberado Hoje
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {promos.slice(0, 3).map((app) => {
          const Icon = app.icon;
          return (
            <Link
              key={app.slug}
              to="/assinar/$slug"
              params={{ slug: app.slug }}
              className={`group relative overflow-hidden rounded-xl border p-2.5 ${app.bg} backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-between gap-2`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/30 dark:bg-white/10">
                  <Icon size={14} className="text-neutral-900 dark:text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h5 className="text-xs font-black text-neutral-900 dark:text-white group-hover:text-amber-400 transition truncate">
                      {app.name}
                    </h5>
                  </div>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-300 font-medium truncate">
                    {app.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="rounded-md bg-amber-400 text-neutral-950 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-tight shadow-sm">
                  {app.tag}
                </span>
                <ArrowRight size={12} className="text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
