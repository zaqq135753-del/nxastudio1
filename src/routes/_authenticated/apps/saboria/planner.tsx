import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { generateMealPlan, type MealPlan } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Sparkles, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/planner")({
  component: PlannerPage,
});

const GOALS = [
  "🥗 Alimentação Saudável",
  "🔥 Emagrecer",
  "💪 Ganhar Massa",
  "💰 Econômico",
  "🌿 Vegetariano",
];
const RESTRICTIONS = ["🚫🥛 Sem lactose", "🚫🌾 Sem glúten", "🚫🥜 Sem amendoim", "🚫🥚 Sem ovos"];
const BUDGETS = ["💰 Até R$150", "💰💰 R$150–R$300", "💰💰💰 R$300+"];

function PlannerPage() {
  const call = useServerFn(generateMealPlan);
  const [goal, setGoal] = useState(GOALS[0]);
  const [people, setPeople] = useState(2);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [openDay, setOpenDay] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggleRestriction(r: string) {
    setRestrictions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  async function generate() {
    setLoading(true);
    setPlan(null);
    setChecked(new Set());
    try {
      const r = await call({
        data: { goal, people, restrictions, budget },
      });
      setPlan(r);
      setOpenDay(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar plano");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <ScreenHeader
        title="📅 Meal Planner Semanal"
        subtitle="A IA cria um plano alimentar completo com lista de compras"
      />

      <div className="glass mb-4 space-y-4 p-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
            Objetivo
          </label>
          <select className="input-field" value={goal} onChange={(e) => setGoal(e.target.value)}>
            {GOALS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
            Número de pessoas
          </label>
          <select
            className="input-field"
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "pessoa" : "pessoas"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
            Restrições alimentares
          </label>
          <div className="flex flex-wrap gap-2">
            {RESTRICTIONS.map((r) => (
              <button
                key={r}
                onClick={() => toggleRestriction(r)}
                className={`chip ${restrictions.includes(r) ? "chip-active" : "chip-neutral"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
            Orçamento semanal
          </label>
          <select className="input-field" value={budget} onChange={(e) => setBudget(e.target.value)}>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <button className="btn-primary mb-6 w-full" onClick={generate} disabled={loading}>
        <Sparkles size={16} /> {loading ? "Gerando..." : "Gerar Plano Semanal com IA"}
      </button>

      {loading && <TypingIndicator label="Criando seu plano alimentar semanal com IA..." />}

      {plan && !loading && (
        <div className="fade-up space-y-3">
          {plan.days.map((d, idx) => {
            const total = d.meals.reduce((acc, m) => {
              const match = m.detail.match(/(\d{2,4})\s*kcal/i);
              return acc + (match ? Number(match[1]) : 0);
            }, 0);
            const open = openDay === idx;
            return (
              <div key={idx} className="glass overflow-hidden">
                <button
                  onClick={() => setOpenDay(open ? -1 : idx)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div>
                    <div className="font-semibold">{d.day}</div>
                    <div className="text-xs" style={{ color: "var(--text-2)" }}>
                      {d.meals.length} refeições{total > 0 && ` • ~${total} kcal`}
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: open ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
                {open && (
                  <div className="space-y-2 border-t px-4 pb-4 pt-3" style={{ borderColor: "var(--line-1)" }}>
                    {d.meals.map((m, i) => (
                      <div key={i} className="rounded-lg p-3" style={{ background: "var(--bg-2)" }}>
                        <div
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: "var(--brand-2)" }}
                        >
                          {m.type}
                        </div>
                        <div className="mt-1 font-medium">{m.name}</div>
                        <div className="mt-1 text-xs" style={{ color: "var(--text-2)" }}>
                          {m.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {plan.shoppingList?.length > 0 && (
            <div className="glass mt-6 p-5">
              <h3 className="text-lg font-semibold">🛒 Lista de Compras Semanal</h3>
              <p className="mt-1 text-xs" style={{ color: "var(--text-2)" }}>
                Gerada automaticamente com base no plano alimentar
              </p>
              {plan.totalEstimatedCost && (
                <div className="mt-2 text-sm" style={{ color: "var(--brand-2)" }}>
                  Custo estimado: {plan.totalEstimatedCost}
                </div>
              )}
              <ul className="mt-4 space-y-2">
                {plan.shoppingList.map((item, i) => {
                  const isChecked = checked.has(i);
                  return (
                    <li key={i}>
                      <button
                        onClick={() => {
                          setChecked((prev) => {
                            const next = new Set(prev);
                            if (next.has(i)) next.delete(i);
                            else next.add(i);
                            return next;
                          });
                        }}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors hover:bg-white/5"
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                          style={{
                            borderColor: isChecked ? "var(--brand)" : "var(--line-2)",
                            background: isChecked ? "var(--brand)" : "transparent",
                          }}
                        >
                          {isChecked && <span className="text-[10px] text-white">✓</span>}
                        </span>
                        <span
                          style={{
                            textDecoration: isChecked ? "line-through" : "none",
                            color: isChecked ? "var(--text-3)" : "var(--text-1)",
                          }}
                        >
                          {item}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
