import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { listSessions, listWorkouts } from "@/lib/fit.functions";

export const Route = createFileRoute("/_authenticated/apps/fitia/progresso")({
  component: ProgressoPage,
});

type Session = { id: string; duration_min: number; calories: number | null; completed_on: string; notes: string | null };
type Workout = { id: string; title: string; created_at: string };

function ProgressoPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const fetchS = useServerFn(listSessions);
  const fetchW = useServerFn(listWorkouts);

  useEffect(() => {
    (async () => {
      const [s, w] = await Promise.all([fetchS(), fetchW()]);
      setSessions(s as unknown as Session[]);
      setWorkouts(w as unknown as Workout[]);
    })();
  }, [fetchS, fetchW]);

  const totalMin = sessions.reduce((s, x) => s + (x.duration_min || 0), 0);
  const totalHours = Math.floor(totalMin / 60);

  // last 8 weeks bar chart
  const weeks: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(); start.setDate(start.getDate() - i * 7);
    const end = new Date(start); end.setDate(end.getDate() + 7);
    const count = sessions.filter((s) => {
      const d = new Date(s.completed_on);
      return d >= start && d < end;
    }).length;
    weeks.push({ label: `S${8 - i}`, count });
  }
  const maxCount = Math.max(1, ...weeks.map((w) => w.count));

  return (
    <AppShell appSlug="fitia">
      <ScreenHeader title="Progresso" subtitle="Acompanhe consistência e evolução." />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Sessões" value={sessions.length} />
        <Stat label="Horas" value={`${totalHours}h`} />
        <Stat label="Treinos gerados" value={workouts.length} />
      </div>

      <div className="surface p-5 mb-6">
        <div className="edition-tag mb-3">Últimas 8 semanas</div>
        <div className="flex items-end justify-between gap-2 h-32">
          {weeks.map((w) => (
            <div key={w.label} className="flex-1 flex flex-col items-center">
              <div className="w-full rounded-t-md transition-all" style={{
                height: `${(w.count / maxCount) * 100}%`, minHeight: 4,
                background: w.count > 0 ? "var(--c-orange)" : "var(--n-100)",
              }} />
              <div className="text-[10px] mt-1" style={{ color: "var(--n-500)" }}>{w.label}</div>
              <div className="text-[10px] font-semibold">{w.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="edition-tag mb-2">Histórico recente</div>
        {sessions.length === 0 ? (
          <div className="surface p-5 text-center text-sm" style={{ color: "var(--n-500)" }}>Sem sessões registradas.</div>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 20).map((s) => (
              <div key={s.id} className="surface flex justify-between p-3 text-sm">
                <span>{new Date(s.completed_on).toLocaleDateString("pt-BR")}</span>
                <span style={{ color: "var(--n-500)" }}>{s.duration_min} min</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface p-4">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
    </div>
  );
}
