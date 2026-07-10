import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { generateWorkout, completeSession, upsertFitProfile, getFitProfile, type Workout } from "@/lib/fit.functions";
import { Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/apps/fitia/treino")({
  component: TreinoPage,
});

const GOALS = ["Perder peso", "Ganhar massa", "Manter forma", "Resistência"];
const LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const EQUIP = ["Nenhum", "Halteres", "Barra", "Elásticos", "Academia completa"];

function TreinoPage() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutId, setWorkoutId] = useState<string | undefined>();
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  // profile mini-form
  const [goal, setGoal] = useState(GOALS[0]);
  const [level, setLevel] = useState(LEVELS[0]);
  const [equip, setEquip] = useState<string[]>([]);

  const gen = useServerFn(generateWorkout);
  const complete = useServerFn(completeSession);
  const saveProfile = useServerFn(upsertFitProfile);
  const getProfile = useServerFn(getFitProfile);

  useEffect(() => {
    getProfile().then((p) => setHasProfile(!!p));
  }, [getProfile]);

  async function submitProfile() {
    await saveProfile({ data: { goal, fitness_level: level, equipment: equip } });
    setHasProfile(true);
    toast.success("Perfil salvo");
  }

  async function make() {
    setLoading(true);
    try {
      const res = await gen({ data: { focus } });
      setWorkout(res.workout);
      setWorkoutId(res.id);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  async function finish() {
    if (!workout) return;
    try {
      await complete({ data: { workout_id: workoutId, duration_min: workout.duration_min } });
      toast.success("Treino registrado!");
      setWorkout(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
  }

  if (hasProfile === false) {
    return (
      <AppShell appSlug="fitia">
        <ScreenHeader title="Configure seu perfil" subtitle="Precisamos disso pra gerar treinos precisos." />
        <div className="surface p-5 space-y-4">
          <Field label="Objetivo">
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => <Chip key={g} label={g} active={goal === g} onClick={() => setGoal(g)} />)}
            </div>
          </Field>
          <Field label="Nível">
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => <Chip key={l} label={l} active={level === l} onClick={() => setLevel(l)} />)}
            </div>
          </Field>
          <Field label="Equipamentos disponíveis">
            <div className="flex flex-wrap gap-2">
              {EQUIP.map((e) => <Chip key={e} label={e} active={equip.includes(e)}
                onClick={() => setEquip((p) => p.includes(e) ? p.filter((x) => x !== e) : [...p, e])} />)}
            </div>
          </Field>
          <button onClick={submitProfile} className="btn-primary">Salvar e continuar</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell appSlug="fitia">
      <ScreenHeader title="Treino" subtitle="A IA cria um treino baseado no seu perfil." />

      {!workout && (
        <div className="surface p-5 space-y-3 mb-6">
          <input value={focus} onChange={(e) => setFocus(e.target.value)}
            placeholder="Foco (opcional): peito, cardio, pernas, mobilidade…"
            className="input-field w-full" />
          <button onClick={make} disabled={loading} className="btn-primary w-full">
            <Sparkles size={14} /> {loading ? "Gerando treino…" : "Gerar treino agora"}
          </button>
          <Link to="/apps/fitia" className="chip chip-neutral inline-flex">Voltar</Link>
        </div>
      )}

      {workout && (
        <div className="surface p-5 fade-up space-y-4">
          <div>
            <div className="text-xl font-bold">{workout.title}</div>
            <div className="text-sm" style={{ color: "var(--n-500)" }}>
              {workout.focus} · {workout.duration_min} min · {workout.difficulty}
            </div>
          </div>

          {workout.warmup?.length > 0 && (
            <div>
              <div className="edition-tag mb-1">Aquecimento</div>
              <ul className="text-sm space-y-1" style={{ color: "var(--n-500)" }}>
                {workout.warmup.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            </div>
          )}

          <div>
            <div className="edition-tag mb-2">Exercícios</div>
            <div className="space-y-2">
              {workout.exercises.map((ex, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: "var(--n-100)" }}>
                  <div className="font-semibold text-sm">{i + 1}. {ex.name}</div>
                  <div className="text-xs" style={{ color: "var(--n-500)" }}>
                    {ex.sets} séries · {ex.reps} reps · {ex.rest_s}s descanso
                  </div>
                  {ex.tips && <div className="mt-1 text-xs italic" style={{ color: "var(--n-500)" }}>💡 {ex.tips}</div>}
                </div>
              ))}
            </div>
          </div>

          {workout.cooldown?.length > 0 && (
            <div>
              <div className="edition-tag mb-1">Alongamento</div>
              <ul className="text-sm space-y-1" style={{ color: "var(--n-500)" }}>
                {workout.cooldown.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={finish} className="btn-primary flex-1"><Check size={14} /> Concluí o treino</button>
            <button onClick={() => setWorkout(null)} className="chip chip-neutral">Descartar</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--n-500)" }}>{label}</div>
      {children}
    </div>
  );
}
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className="chip"
    style={{ background: active ? "var(--c-orange)" : "var(--n-100)", color: active ? "#fff" : undefined }}>{label}</button>;
}
