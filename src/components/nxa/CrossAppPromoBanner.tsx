import { Sparkles, ArrowRight, ChefHat, Dumbbell, Wallet, Languages, Tag, Zap, Flame } from "lucide-react";
import { Link } from "@tanstack/react-router";

const ALL_APPS = [
  { slug: "saboria", name: "NXA Chef", desc: "Receitas por foto da geladeira", icon: ChefHat, tag: "50% OFF", bg: "from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-900 dark:text-amber-300" },
  { slug: "fitia", name: "NXA Fit", desc: "Treinos e dieta personalizada por IA", icon: Dumbbell, tag: "R$ 14,90", bg: "from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-900 dark:text-emerald-300" },
  { slug: "granaia", name: "NXA Grana", desc: "Controle financeiro inteligente", icon: Wallet, tag: "VIP DESCONTO", bg: "from-indigo-500/20 to-blue-500/20 border-indigo-500/50 text-indigo-900 dark:text-indigo-300" },
  { slug: "fluencyia", name: "NXA Fluency", desc: "Aprenda inglês conversando com IA", icon: Languages, tag: "BÔNUS 50%", bg: "from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-900 dark:text-purple-300" },
];

export function CrossAppPromoBanner({ currentSlug }: { currentSlug: string }) {
  const promos = ALL_APPS.filter((a) => a.slug !== currentSlug);
  // Duplicamos o array para criar um loop infinito continuo impecável (Marquee)
  const marqueeItems = [...promos, ...promos, ...promos];

  return (
    <div className="mb-8 fade-up overflow-hidden">
      {/* Header do Banner com Animação Piscante e Neon */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 animate-pulse">
            <Flame size={14} className="text-amber-500 animate-bounce" />
            <span>Clube de Vantagens NXA Studio</span>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold text-neutral-600 dark:text-neutral-300">
            Conheça nossas outras IAs com desconto exclusivo
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 tracking-wider animate-pulse">
          <Zap size={12} className="text-emerald-500 animate-spin" /> Oferta por Tempo Limitado
        </div>
      </div>

      {/* Marquee Continuo Animado (Carrossel deslizando da direita para esquerda sem parar) */}
      <div className="relative w-full overflow-hidden p-1.5 rounded-2xl bg-neutral-900/90 dark:bg-neutral-950/80 border border-neutral-700/80 dark:border-neutral-800 backdrop-blur-md shadow-2xl">
        {/* Fade de gradiente nas bordas para suavizar a passagem */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-2.5 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
          {marqueeItems.map((app, index) => {
            const Icon = app.icon;
            return (
              <Link
                key={`${app.slug}-${index}`}
                to="/assinar/$slug"
                params={{ slug: app.slug }}
                className={`group shrink-0 relative overflow-hidden rounded-xl border border-white/20 p-2.5 bg-gradient-to-r ${app.bg} backdrop-blur-xl transition hover:scale-105 hover:shadow-xl flex items-center gap-2.5 w-60 sm:w-64`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 text-white shadow-md">
                  <Icon size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-black text-white group-hover:text-amber-300 transition truncate">
                      {app.name}
                    </h5>
                    <span className="rounded-md bg-amber-400 text-neutral-950 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-tight shadow-sm shrink-0 animate-pulse">
                      {app.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-200 font-bold truncate mt-0.5">
                    {app.desc}
                  </p>
                </div>

                <ArrowRight size={13} className="text-white/70 group-hover:text-amber-300 group-hover:translate-x-0.5 transition shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
