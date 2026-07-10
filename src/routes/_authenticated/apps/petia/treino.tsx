import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { usePets } from "@/hooks/use-pets";
import { trainingPlan, type TrainingPlan } from "@/lib/pet.functions";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/petia/treino")({
  component: TreinoPage,
});

const ISSUES = [
  { icon: "🗣️", label: "Late muito" },
  { icon: "💧", label: "Faz xixi em casa" },
  { icon: "🦮", label: "Puxa na coleira" },
  { icon: "🪑", label: "Rói móveis" },
  { icon: "🙌", label: "Pula nas pessoas" },
  { icon: "😾", label: "Agressividade com outros pets" },
];

const COMMANDS = [
  { name: "Senta", tips: ["Segure petisco acima do focinho", "Mova para trás até ele sentar", "Diga 'senta' e recompense"] },
  { name: "Deita", tips: ["Comece com o pet sentado", "Leve o petisco ao chão", "Recompense quando deitar completo"] },
  { name: "Fica", tips: ["Peça 'senta' primeiro", "Mão aberta, diga 'fica'", "Recompense após 2s, aumente gradualmente"] },
  { name: "Vem", tips: ["Use tom animado", "Abaixe-se e chame pelo nome", "Recompense generosamente"] },
];

function TreinoPage() {
  const { active } = usePets();
  const [issue, setIssue] = useState("");
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(trainingPlan);

  async function generate(text?: string) {
    if (!active) return toast.error("Cadastre um pet primeiro");
    const b = (text ?? issue).trim();
    if (!b) return;
    setIssue(b);
    setLoading(true);
    try { setPlan(await gen({ data: { petId: active.id, behaviorIssue: b } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  if (!active) return <AppShell appSlug="petia"><div className="pt-16 text-center text-sm">Cadastre um pet primeiro.</div></AppShell>;

  return (
    <AppShell appSlug="petia">
      <ScreenHeader title="Treino e Comportamento" subtitle="Planos com reforço positivo, guiados pela IA." />

      <section className="mb-6 fade-up">
        <div className="edition-tag mb-3">Problemas comuns</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ISSUES.map((i) => (
            <button key={i.label} onClick={() => generate(i.label)}
              className="surface p-3 text-left text-sm hover:brightness-95 transition">
              <div className="text-xl">{i.icon}</div>
              <div className="mt-1 font-medium">{i.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 surface p-5 fade-up">
        <h3 className="mb-3 font-semibold">Descreva o comportamento</h3>
        <textarea value={issue} onChange={(e) => setIssue(e.target.value)}
          placeholder="Ex.: Meu cão pula nas pessoas quando chegam em casa"
          className="input-field min-h-[90px] mb-2" />
        <button onClick={() => generate()} disabled={loading} className="btn-primary">
          <Sparkles size={14} /> {loading ? "Criando plano…" : "Gerar plano de treino"}
        </button>
      </section>

      {plan && (
        <section className="mb-6 fade-up">
          <div className="edition-tag mb-3">{plan.duration}</div>
          <div className="surface p-5 space-y-4 text-sm">
            <div>
              <h3 className="text-lg font-semibold">{plan.title}</h3>
              <p className="mt-1" style={{ color: "var(--n-500)" }}>{plan.understanding}</p>
            </div>
            <div className="space-y-3">
              {plan.steps.map((s) => (
                <div key={s.week} className="rounded-xl p-3" style={{ background: "var(--n-100)" }}>
                  <div className="text-xs font-semibold uppercase" style={{ color: "var(--c-orange)" }}>Semana {s.week}</div>
                  <div className="font-medium">{s.focus}</div>
                  <ul className="mt-2 ml-4 list-disc">{s.exercises.map((e, i) => <li key={i}>{e}</li>)}</ul>
                  {s.tips.length > 0 && (
                    <div className="mt-2 text-xs" style={{ color: "var(--n-500)" }}>
                      💡 {s.tips.join(" · ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {plan.donts.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: "#fee2e2", color: "#991b1b" }}>
                <div className="mb-1 text-xs font-semibold uppercase">O que NÃO fazer</div>
                <ul className="ml-4 list-disc">{plan.donts.map((d, i) => <li key={i}>{d}</li>)}</ul>
              </div>
            )}
            <div className="text-xs" style={{ color: "var(--n-500)" }}>
              🧑‍🏫 <b>Quando buscar ajuda:</b> {plan.whenToSeekHelp}
            </div>
          </div>
        </section>
      )}

      <section className="mb-6 fade-up">
        <div className="edition-tag mb-3">Comandos básicos</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {COMMANDS.map((c) => (
            <div key={c.name} className="surface p-4">
              <div className="font-semibold">{c.name}</div>
              <ol className="mt-1 ml-4 list-decimal text-sm" style={{ color: "var(--n-700)" }}>
                {c.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
