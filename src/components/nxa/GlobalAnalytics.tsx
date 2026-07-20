import { motion } from "framer-motion";
import { Users, Zap, Globe, Cpu } from "lucide-react";

export function GlobalAnalytics() {
  const stats = [
    { label: "Usuários Online", value: "1.2k", icon: Users, color: "text-blue-400" },
    { label: "Ações IA / min", value: "450", icon: Zap, color: "text-orange-400" },
    { label: "Países Ativos", value: "12", icon: Globe, color: "text-green-400" },
    { label: "Uptime Engine", value: "99.9%", icon: Cpu, color: "text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="surface flex flex-col items-center justify-center p-4 text-center"
        >
          <s.icon size={18} className={s.color} />
          <div className="mt-2 text-xl font-bold">{s.value}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
