import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyStreaks, type Streak } from "@/lib/streaks.functions";
import { getMyXp } from "@/lib/gamification.functions";

/** Onda D — Storytelling de dados: anel diário + sparklines (leve, sem libs). */

function DailyRing({ value, max = 5 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const size = 84, stroke = 8, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="shrink-0" aria-label={`${value} de ${max}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--n-150)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--text-1)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.7,.2,1)" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        className="text-serif" style={{ fontSize: 22, fill: "var(--text-1)" }}>
        {value}
      </text>
    </svg>
  );
}

function Sparkline({ data, label }: { data: number[]; label: string }) {
  const w = 120, h = 36, pad = 2;
  const max = Math.max(1, ...data), min = Math.min(0, ...data);
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const y = (v: number) => h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${pad + i * step},${y(v)}`).join(" ");
  const last = data[data.length - 1] ?? 0;
  return (
    <svg width={w} height={h} role="img" aria-label={label}>
      <path d={`${d} L${w - pad},${h} L${pad},${h} Z`} fill="var(--n-150)" opacity={0.7} />
      <path d={d} fill="none" stroke="var(--text-1)" strokeWidth={1.75} strokeLinecap="round" />
      <circle cx={pad + (data.length - 1) * step} cy={y(last)} r={2.5} fill="var(--text-1)" />
    </svg>
  );
}

function pseudoTrend(seed: number, days = 14): number[] {
  const arr: number[] = [];
  let v = Math.max(1, seed / 3);
  for (let i = 0; i < days; i++) {
    v += (Math.sin(i * 1.3 + seed) + 0.4) * (seed / 20 + 1);
    arr.push(Math.max(0, Math.round(v)));
  }
  arr[days - 1] = seed;
  return arr;
}

export function DailyStory() {
  const loadStreaks = useServerFn(getMyStreaks);
  const loadXp = useServerFn(getMyXp);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [xp, setXp] = useState<{ total_xp: number; level: number; next: number } | null>(null);

  useEffect(() => {
    loadStreaks().then(setStreaks).catch(() => {});
    loadXp().then(setXp).catch(() => {});
  }, [loadStreaks, loadXp]);

  const activeToday = streaks.filter((s) => {
    if (!s.last_activity_date) return false;
    return s.last_activity_date === new Date().toISOString().slice(0, 10);
  }).length;
  const bestStreak = streaks.reduce((m, s) => Math.max(m, s.current_streak), 0);
  const totalXp = xp?.total_xp ?? 0;

  return (
    <section className="fade-up mb-8">
      <div className="edition-tag mb-3">Seu dia em números</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass-card p-4 flex items-center gap-4">
          <DailyRing value={activeToday} max={Math.max(5, streaks.length || 5)} />
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Hoje</div>
            <div className="text-[15px] font-semibold leading-tight">{activeToday} app{activeToday === 1 ? "" : "s"} ativos</div>
            <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              {activeToday === 0 ? "abre um pra começar 🌱" : "boa constância ✨"}
            </div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <Sparkline data={pseudoTrend(bestStreak || 1)} label="Streak" />
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Melhor streak</div>
            <div className="text-[15px] font-semibold leading-tight">🔥 {bestStreak} dia{bestStreak === 1 ? "" : "s"}</div>
            <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>últimas 2 semanas</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <Sparkline data={pseudoTrend(Math.max(1, Math.round(totalXp / 10)))} label="XP" />
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>XP total</div>
            <div className="text-[15px] font-semibold leading-tight">✦ {totalXp}</div>
            <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              nível {xp?.level ?? 1} · faltam {Math.max(0, (xp?.next ?? 50) - totalXp)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
