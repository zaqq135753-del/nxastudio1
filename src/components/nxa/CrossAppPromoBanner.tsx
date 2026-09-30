import { Sparkles, ArrowRight, ChefHat, Dumbbell, Wallet, Languages, Flame, BookOpen, HeartPulse } from "lucide-react";
import { Link } from "@tanstack/react-router";

const ALL_APPS = [
  { slug: "saboria", name: "NXA Chef", desc: "Receitas por foto & Nutri", icon: ChefHat, tag: "R$ 8,90", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  { slug: "fitia", name: "NXA Fit", desc: "Treinos e dieta com IA", icon: Dumbbell, tag: "R$ 8,90", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { slug: "granaia", name: "NXA Grana", desc: "Controle financeiro", icon: Wallet, tag: "R$ 8,90", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { slug: "fluencyia", name: "NXA Fluency", desc: "Inglês 24h por voz", icon: Languages, tag: "R$ 8,90", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  { slug: "studyia", name: "NXA Study", desc: "Redação & Simulados ENEM", icon: BookOpen, tag: "R$ 8,90", color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/20" },
  { slug: "petia", name: "NXA Pet", desc: "Vet e cuidados do pet", icon: HeartPulse, tag: "R$ 8,90", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
];

export function CrossAppPromoBanner({ currentSlug }: { currentSlug: string }) {
  const promos = ALL_APPS.filter((a) => a.slug !== currentSlug);
  const marqueeItems = [...promos, ...promos, ...promos];

  return (
    <div className="mb-6 fade-up">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-4 sm:p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
        
        {/* Glow sutil e elegante no background */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Lado Esquerdo: Ícone + Chamada de Oferta */}
          <div className="flex items-center gap-3.5 z-10 shrink-0">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/20 border border-amber-500/30 text-amber-500 shadow-sm">
              <Sparkles size={22} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Flame size={11} className="text-amber-500" /> OFERTA ESPECIAL
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  R$ 8,90 / MÊS CADA
                </span>
              </div>
              <h4 className="text-sm sm:text-[15px] font-bold text-foreground tracking-tight mt-1 flex items-center gap-1.5 flex-wrap">
                Outras IAs de <span className="line-through text-muted-foreground font-semibold">R$ 29,90</span> por apenas <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-base">R$ 8,90</span> cada!
              </h4>
            </div>
          </div>

          {/* Lado Direito: Carrossel Ticker com chips modernos */}
          <div className="relative w-full lg:w-[460px] overflow-hidden rounded-xl bg-muted/40 border border-border/50 p-2 z-10">
            {/* Máscaras de gradiente que respeitam o tema do app */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-20 pointer-events-none" />

            <div className="flex gap-4 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
              {marqueeItems.map((app, index) => {
                const Icon = app.icon;
                return (
                  <Link
                    key={`${app.slug}-${index}`}
                    to="/assinar/$slug"
                    params={{ slug: app.slug }}
                    className="inline-flex items-center gap-2 rounded-lg bg-background/80 hover:bg-background border border-border/60 px-2.5 py-1.5 transition-all shadow-2xs hover:border-primary/40 group shrink-0"
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md border ${app.bg} ${app.color}`}>
                      <Icon size={13} />
                    </div>

                    <span className="text-xs font-bold text-foreground tracking-tight">
                      {app.name}
                    </span>

                    <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-1.5 py-0.2 text-[9px] font-black uppercase">
                      {app.tag}
                    </span>

                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      · {app.desc}
                    </span>

                    <ArrowRight size={11} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
