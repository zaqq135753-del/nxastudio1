import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyStreaks, getMyBadges, type Streak, type Badge } from "@/lib/streaks.functions";
import { Flame, Trophy, Sparkles } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame, trophy: Trophy, sparkles: Sparkles,
};

export function StreaksBadges() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const loadS = useServerFn(getMyStreaks);
  const loadB = useServerFn(getMyBadges);

  useEffect(() => {
    loadS().then(setStreaks).catch(() => {});
    loadB().then(setBadges).catch(() => {});
  }, [loadS, loadB]);

  const topStreak = streaks.reduce((a, s) => Math.max(a, s.current_streak), 0);

  if (streaks.length === 0 && badges.length === 0) return null;

  return (
    <section className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sua jornada</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>{topStreak} dias seguidos</span>
        </div>
      </header>

      {streaks.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {streaks.filter(s => s.current_streak > 0).map(s => (
            <div key={s.app_slug} className="flex-shrink-0 rounded-2xl bg-muted/50 px-3 py-2 text-xs">
              <div className="font-medium capitalize">{s.app_slug}</div>
              <div className="text-muted-foreground flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />{s.current_streak}d
              </div>
            </div>
          ))}
        </div>
      )}

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.slice(0, 8).map(b => {
            const Icon = iconMap[b.icon ?? "sparkles"] ?? Sparkles;
            return (
              <div key={b.id} className="flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{b.title}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
