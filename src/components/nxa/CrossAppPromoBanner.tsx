import { Sparkles, ArrowRight, ChefHat, Dumbbell, Wallet, Languages, Tag, Zap, Flame, Gift } from "lucide-react";
import { Link } from "@tanstack/react-router";

const ALL_APPS = [
  { slug: "saboria", name: "NXA Chef", desc: "Receitas por foto", icon: ChefHat, tag: "R$ 29,90", color: "text-amber-400" },
  { slug: "fitia", name: "NXA Fit", desc: "Treinos e dieta com IA", icon: Dumbbell, tag: "R$ 29,90", color: "text-emerald-400" },
  { slug: "granaia", name: "NXA Grana", desc: "Controle financeiro", icon: Wallet, tag: "R$ 29,90", color: "text-blue-400" },
  { slug: "fluencyia", name: "NXA Fluency", desc: "Inglês 24h por voz", icon: Languages, tag: "R$ 29,90", color: "text-purple-400" },
];

export function CrossAppPromoBanner({ currentSlug }: { currentSlug: string }) {
  const promos = ALL_APPS.filter((a) => a.slug !== currentSlug);
  const marqueeItems = [...promos, ...promos, ...promos, ...promos];

  return (
    <div className="mb-8 fade-up">
      {/* Banner Tíquete Unificado com LED de Borda e Animações Automáticas Continuas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 p-0.5 shadow-2xl border border-indigo-500/40">
        
        {/* Luzes LED Pulsantes de Fundo (Automáticas - sem necessidade de hover) */}
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-amber-500/30 blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/30 blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Faixa Tíquete Unificada */}
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl rounded-[23px] overflow-hidden border border-purple-500/10 dark:border-purple-500/20">
          
          {/* Lado Esquerdo: Tag de Presente Pulsante Automática & Chamada */}
          <div className="flex items-center gap-3.5 z-10 shrink-0">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-neutral-950 font-black shadow-lg animate-bounce">
              <Gift size={24} className="animate-spin" style={{ animationDuration: "8s" }} />
              {/* LED de Ponto Neon */}
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-neutral-950 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30 animate-pulse">
                  <Flame size={12} className="animate-bounce" /> OFERTA EXCLUSIVA ALUNOS
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 animate-pulse">
                  R$ 29,90 / MÊS CADA
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white tracking-tight mt-1 flex items-center gap-1.5">
                Outras IAs de <span className="line-through text-neutral-400 font-bold">R$ 45,90</span> por apenas <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">R$ 29,90</span> cada!
              </h4>
            </div>
          </div>

          {/* Lado Direito: Carrossel Marquee Ticker 100% Unificado Sem Camadas Separadas */}
          <div className="relative w-full sm:w-[420px] overflow-hidden rounded-xl bg-white/5 border border-white/10 p-2 z-10 backdrop-blur-md">
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-neutral-950 to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-neutral-950 to-transparent z-20 pointer-events-none" />

            <div className="flex gap-6 animate-marquee whitespace-nowrap">
              {marqueeItems.map((app, index) => {
                const Icon = app.icon;
                return (
                  <Link
                    key={`${app.slug}-${index}`}
                    to="/assinar/$slug"
                    params={{ slug: app.slug }}
                    className="inline-flex items-center gap-2.5 group hover:opacity-80 transition"
                  >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 ${app.color} shadow-inner animate-pulse`}>
                      <Icon size={15} />
                    </div>

                    <span className="text-xs font-black text-white tracking-tight">
                      {app.name}
                    </span>

                    <span className="rounded-md bg-amber-400 text-neutral-950 px-1.5 py-0.5 text-[9px] font-black uppercase shadow-sm animate-bounce" style={{ animationDuration: "2s" }}>
                      {app.tag}
                    </span>

                    <span className="text-[10px] text-neutral-400 font-bold">
                      · {app.desc}
                    </span>

                    <ArrowRight size={12} className="text-amber-400 animate-pulse" />
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
