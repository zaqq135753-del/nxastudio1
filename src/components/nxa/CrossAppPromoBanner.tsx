import { Sparkles, ArrowRight, ChefHat, Dumbbell, Wallet, Languages } from "lucide-react";
import { Link } from "@tanstack/react-router";

const OTHER_APPS = [
  { slug: "saboria", name: "NXA Chef", desc: "Receitas de chef por foto da geladeira", icon: ChefHat, tag: "50% OFF", color: "from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400" },
  { slug: "fitia", name: "NXA Fit", desc: "Treinos e dieta personalizada por IA", icon: Dumbbell, tag: "Popular", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400" },
  { slug: "granaia", name: "NXA Grana", desc: "Controle financeiro e metas inteligentes", icon: Wallet, tag: "VIP", color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400" },
  { slug: "fluencyia", name: "NXA Fluency", desc: "Aprenda inglês conversando com IA 24h", icon: Languages, tag: "Bônus", color: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-purple-400" },
];

export function CrossAppPromoBanner({ currentSlug }: { currentSlug: string }) {
  const promos = OTHER_APPS.filter((a) => a.slug !== currentSlug);

  return (
    <div className="mb-8 fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Ecossistema NXA Studio & Ofertas Especiais
          </span>
        </div>
        <span className="text-[11px] font-semibold text-indigo-400">
          Clube de Alunos: Desconto Ativo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {promos.slice(0, 3).map((app) => {
          const Icon = app.icon;
          return (
            <Link
              key={app.slug}
              to="/assinar/$slug"
              params={{ slug: app.slug }}
              className={`group relative overflow-hidden rounded-2xl border p-4 bg-gradient-to-br ${app.color} backdrop-blur-md transition hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      {app.name}
                    </h5>
                    <p className="text-[11px] text-neutral-300 line-clamp-1">
                      {app.desc}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-extrabold text-amber-300 uppercase tracking-wider">
                  {app.tag}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold pt-2 border-t border-white/10">
                <span className="text-neutral-400">Liberar Acesso Especial</span>
                <ArrowRight size={14} className="text-white group-hover:translate-x-1 transition" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
