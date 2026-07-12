/**
 * Onda N — Weekly Review
 * Aparece aos domingos (0) e segundas (1) até 12h. Resume a semana do usuário
 * a partir do log de atividade local + XP acumulado. Cache semanal em localStorage.
 */
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateWeeklyReview, type WeeklyReview } from "@/lib/ai.functions";
import { readActivity } from "@/lib/reward";
import { CalendarCheck, Trophy, Target, ArrowUpRight } from "lucide-react";

const KEY = "nxa:weekly:v1";

function isReviewTime() {
  const d = new Date();
  const day = d.getDay();
  const h = d.getHours();
  // Domingo o dia todo, ou segunda até meio-dia
  return day === 0 || (day === 1 && h < 12);
}

function weekKey() {
  const d = new Date();
  // âncora: domingo dessa semana
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  return sunday.toISOString().slice(0, 10);
}

type Cache = { week: string; review: WeeklyReview };

export function WeeklyReviewCard({ name, apps }: { name?: string; apps: string[] }) {
  const gen = useServerFn(generateWeeklyReview);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(false);
  const visible = isReviewTime();

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const items = readActivity().filter((i) => i.at >= weekAgo);
    const totalXp = items.reduce((s, i) => s + (i.amount ?? 0), 0);
    const counts = new Map<string, number>();
    for (const i of items) counts.set(i.reason, (counts.get(i.reason) ?? 0) + 1);
    const topReasons = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([r]) => r);
    return { totalXp, actionCount: items.length, topReasons };
  }, []);

  useEffect(() => {
    if (!visible) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const c = JSON.parse(raw) as Cache;
        if (c.week === weekKey()) setReview(c.review);
      }
    } catch { /* noop */ }
  }, [visible]);

  if (!visible) return null;

  async function generate() {
    setLoading(true);
    try {
      const r = await gen({
        data: {
          name,
          totalXp: stats.totalXp,
          actionCount: stats.actionCount,
          topReasons: stats.topReasons,
          apps,
        },
      });
      setReview(r);
      localStorage.setItem(KEY, JSON.stringify({ week: weekKey(), review: r } satisfies Cache));
    } catch { /* silencia */ }
    finally { setLoading(false); }
  }

  return (
    <div
      className="surface relative overflow-hidden p-6"
      style={{
        background: "linear-gradient(135deg, rgba(180,200,255,0.14), rgba(200,180,255,0.10) 60%, rgba(255,220,200,0.08))",
        border: "1px solid rgba(160,170,220,0.20)",
      }}
    >
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(180,170,255,0.30), transparent 70%)" }} />

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest" style={{ color: "var(--n-500)" }}>
        <CalendarCheck size={12} /> Revisão da semana
      </div>

      {!review && (
        <div className="mt-3">
          <div className="text-xl font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {stats.actionCount > 0
              ? `Você somou ${stats.totalXp} XP em ${stats.actionCount} ações.`
              : "Semana leve — bora traçar a próxima?"}
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--n-600)" }}>
            Deixa a NXA olhar seu histórico e desenhar o próximo passo.
          </p>
          <button onClick={generate} disabled={loading} className="btn-primary mt-4">
            {loading ? "Analisando…" : "Gerar minha revisão"}
          </button>
        </div>
      )}

      {review && (
        <div className="mt-3">
          <div className="text-2xl font-semibold leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {review.headline}
          </div>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--n-700)" }}>
            {review.summary}
          </p>

          {review.wins?.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {review.wins.slice(0, 3).map((w, i) => (
                <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--n-800)" }}>
                  <Trophy size={13} style={{ color: "var(--n-500)" }} />
                  {w}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border p-3" style={{ borderColor: "var(--line-1)" }}>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: "var(--n-500)" }}>
                <Target size={11} /> Foco
              </div>
              <div className="mt-1 text-sm" style={{ color: "var(--n-800)" }}>{review.focus}</div>
            </div>
            <div className="rounded-2xl border p-3" style={{ borderColor: "var(--line-1)" }}>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: "var(--n-500)" }}>
                <ArrowUpRight size={11} /> Próxima meta
              </div>
              <div className="mt-1 text-sm" style={{ color: "var(--n-800)" }}>{review.nextGoal}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
