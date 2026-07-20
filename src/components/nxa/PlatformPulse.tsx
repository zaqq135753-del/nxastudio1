import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPlatformPulse } from "@/lib/pulse.functions";
import { Trophy, TrendingUp, Users, Sparkles } from "lucide-react";
import { APPS } from "@/apps/registry";

export function PlatformPulse() {
  const loadPulse = useServerFn(getPlatformPulse);
  const [data, setData] = useState<Awaited<ReturnType<typeof getPlatformPulse>> | null>(null);

  useEffect(() => {
    loadPulse().then(setData).catch(console.error);
  }, [loadPulse]);

  if (!data) return <div className="animate-pulse h-32 surface" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Trophy size={14} className="text-yellow-500" />
          Top Performers (Global)
        </div>
        <div className="space-y-3">
          {data.leaderboard.map((u, i) => (
            <div key={u.user_id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold opacity-30 w-3">{i + 1}</span>
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                  {u.avatar ? <img src={u.avatar} alt="" className="h-full w-full object-cover" /> : <Users size={12} />}
                </div>
                <span className="text-xs font-medium truncate max-w-[100px]">{u.name || 'NXA User'}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="chip chip-neutral text-[9px] px-1.5 py-0">Lvl {u.level}</span>
                 <span className="text-[10px] font-mono opacity-60">{u.total_xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <TrendingUp size={14} className="text-primary" />
          Conquistas Recentes
        </div>
        <div className="space-y-3">
          {data.recentWins.map((w) => {
             const app = APPS.find(a => a.slug === w.app_slug);
             return (
              <div key={w.id} className="flex items-start gap-3 group cursor-default">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs leading-tight line-clamp-1 italic font-serif">"{w.title}"</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    <span className="font-medium text-foreground">{w.author || 'Membro'}</span> via {app?.name || w.app_slug}
                  </p>
                </div>
              </div>
             );
          })}
          {data.recentWins.length === 0 && (
            <div className="py-4 text-center">
              <p className="text-[10px] text-muted-foreground italic">Nada compartilhado ainda hoje...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
