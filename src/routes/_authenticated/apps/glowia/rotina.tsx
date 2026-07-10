import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { generateRoutine, listRoutines } from "@/lib/glow.functions";
import { Sparkles, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/glowia/rotina")({
  component: RotinaPage,
});

type Step = { order: number; step: string; type: string; note: string };
type Routine = { id: string; period: "AM" | "PM"; steps: Step[] };

function RotinaPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<"AM" | "PM" | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("glowia:checked") ?? "{}"); } catch { return {}; }
  });

  const fetch = useServerFn(listRoutines);
  const gen = useServerFn(generateRoutine);

  useEffect(() => { fetch().then((r) => setRoutines(r as unknown as Routine[])); }, [fetch]);

  async function make(period: "AM" | "PM") {
    setLoading(period);
    try {
      await gen({ data: { period } });
      const rows = await fetch();
      setRoutines(rows as unknown as Routine[]);
      toast.success("Rotina gerada");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(null); }
  }

  function toggle(k: string) {
    const next = { ...checked, [k]: !checked[k] };
    setChecked(next);
    localStorage.setItem("glowia:checked", JSON.stringify(next));
  }

  const latestAM = routines.find((r) => r.period === "AM");
  const latestPM = routines.find((r) => r.period === "PM");

  return (
    <AppShell appSlug="glowia">
      <ScreenHeader title="Rotina AM/PM" subtitle="Sua rotina de cuidados diária personalizada." />

      <div className="grid gap-4 sm:grid-cols-2">
        <RoutineCard title="Manhã" icon={<Sun size={16} />} routine={latestAM}
          onGenerate={() => make("AM")} loading={loading === "AM"} checked={checked} onToggle={toggle} prefix="AM" />
        <RoutineCard title="Noite" icon={<Moon size={16} />} routine={latestPM}
          onGenerate={() => make("PM")} loading={loading === "PM"} checked={checked} onToggle={toggle} prefix="PM" />
      </div>
    </AppShell>
  );
}

function RoutineCard({ title, icon, routine, onGenerate, loading, checked, onToggle, prefix }: {
  title: string; icon: React.ReactNode; routine?: Routine; onGenerate: () => void; loading: boolean;
  checked: Record<string, boolean>; onToggle: (k: string) => void; prefix: string;
}) {
  return (
    <div className="surface p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">{icon} {title}</div>
      {!routine ? (
        <div className="text-sm mb-3" style={{ color: "var(--n-500)" }}>Nenhuma rotina ainda.</div>
      ) : (
        <ul className="space-y-2 mb-3">
          {routine.steps.map((s) => {
            const key = `${prefix}-${s.order}`;
            const done = checked[key];
            return (
              <li key={key}>
                <button onClick={() => onToggle(key)} className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-sm hover:bg-black/5">
                  <input type="checkbox" checked={!!done} readOnly className="mt-1" />
                  <div className="flex-1">
                    <div className={done ? "line-through opacity-60" : "font-medium"}>{s.step}</div>
                    <div className="text-xs" style={{ color: "var(--n-500)" }}>{s.note}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button onClick={onGenerate} disabled={loading} className="btn-primary w-full">
        <Sparkles size={14} /> {loading ? "Gerando…" : routine ? "Regerar" : "Gerar rotina"}
      </button>
    </div>
  );
}
