import { motion } from "framer-motion";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Suggestion {
  id: string;
  title: string;
  desc: string;
  app: string;
  route: string;
  xp: number;
}

const MOCK_SUGGESTIONS: Suggestion[] = [
  { id: "1", title: "Review de ROI", desc: "Você economizou 4h essa semana. Veja como.", app: "Global", route: "/hub", xp: 10 },
  { id: "2", title: "Post Estratégico", desc: "IA detectou alta no seu nicho. Criar agora?", app: "SocialIA", route: "/app/socialia", xp: 25 },
  { id: "3", title: "Otimização de Gastos", desc: "Identificamos 2 assinaturas duplicadas.", app: "GranaIA", route: "/app/granaia", xp: 20 },
];

export function SmartSuggestions() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {MOCK_SUGGESTIONS.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <Lightbulb size={16} />
            </div>
            <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
              +{s.xp} XP
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.app}</div>
            <div className="mt-1 text-sm font-semibold leading-tight">{s.title}</div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.desc}</p>
          </div>
          <Link 
            to={s.route} 
            className="mt-4 flex items-center gap-1 text-[11px] font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Executar Ação <ArrowRight size={12} />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
