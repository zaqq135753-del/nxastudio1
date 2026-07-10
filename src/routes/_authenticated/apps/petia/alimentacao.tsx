import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { usePets } from "@/hooks/use-pets";
import { foodPlan, addMeal, listMeals, type FoodPlan } from "@/lib/pet.functions";
import { Sparkles, Plus, Check, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/petia/alimentacao")({
  component: AlimentacaoPage,
});

type Meal = { id: string; type: string; amount: string | null; meal_time: string | null; notes: string | null; created_at: string };

const KNOWN = {
  allowed: ["frango cozido", "cenoura", "maçã sem semente", "arroz integral", "abóbora", "batata-doce"],
  forbidden: ["chocolate", "uva", "cebola", "alho", "abacate", "xilitol", "café", "álcool"],
  moderate: ["queijo", "pão", "banana", "iogurte natural"],
};

function AlimentacaoPage() {
  const { active } = usePets();
  const [activity, setActivity] = useState<"low" | "medium" | "high">("medium");
  const [conditions, setConditions] = useState("");
  const [plan, setPlan] = useState<FoodPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealType, setMealType] = useState("Ração seca");
  const [mealAmount, setMealAmount] = useState("");
  const [search, setSearch] = useState("");

  const gen = useServerFn(foodPlan);
  const addM = useServerFn(addMeal);
  const listM = useServerFn(listMeals);

  useEffect(() => {
    if (!active) return;
    listM({ data: { petId: active.id } }).then((r) => setMeals(r as Meal[]));
  }, [active, listM]);

  async function generate() {
    if (!active) return;
    setLoading(true);
    try {
      const p = await gen({ data: {
        petId: active.id, activityLevel: activity,
        healthConditions: conditions ? conditions.split(",").map((s) => s.trim()) : [],
      }});
      setPlan(p);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  async function saveMeal() {
    if (!active || !mealType) return;
    await addM({ data: { petId: active.id, type: mealType, amount: mealAmount } });
    setMealAmount("");
    setMeals(await listM({ data: { petId: active.id } }) as Meal[]);
    toast.success("Refeição registrada");
  }

  const filter = (list: string[]) => list.filter((x) => x.toLowerCase().includes(search.toLowerCase()));

  if (!active) return <AppShell appSlug="petia"><div className="pt-16 text-center text-sm">Cadastre um pet primeiro.</div></AppShell>;

  return (
    <AppShell appSlug="petia">
      <ScreenHeader title="Alimentação" subtitle={`Plano personalizado para ${active.name}.`} />

      {/* Plano IA */}
      <section className="mb-6 surface p-5 fade-up">
        <h3 className="mb-3 font-semibold">Gerar plano alimentar</h3>
        <div className="mb-3 flex gap-2">
          {(["low", "medium", "high"] as const).map((l) => (
            <button key={l} onClick={() => setActivity(l)}
              className="chip"
              style={{
                background: activity === l ? "var(--c-orange)" : "var(--n-100)",
                color: activity === l ? "#fff" : "var(--n-700)",
                borderColor: "transparent",
              }}>
              {l === "low" ? "Baixa" : l === "medium" ? "Média" : "Alta"} atividade
            </button>
          ))}
        </div>
        <input value={conditions} onChange={(e) => setConditions(e.target.value)}
          placeholder="Condições de saúde (opcional, separe por vírgula)"
          className="input-field mb-3" />
        <button onClick={generate} disabled={loading} className="btn-primary">
          <Sparkles size={14} /> {loading ? "Calculando…" : "Gerar plano"}
        </button>

        {plan && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl p-3" style={{ background: "var(--n-100)" }}>
              <div className="text-xs uppercase" style={{ color: "var(--n-500)" }}>Calorias diárias</div>
              <div className="text-2xl font-bold">{plan.dailyCalories} kcal</div>
            </div>
            <div className="space-y-2">
              {plan.meals.map((m, i) => (
                <div key={i} className="surface flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium">{m.time} · {m.type}</div>
                    <div className="text-xs" style={{ color: "var(--n-500)" }}>{m.amount}{m.notes ? ` — ${m.notes}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
            {plan.tips.length > 0 && (
              <div>
                <div className="edition-tag mb-2">Dicas</div>
                <ul className="ml-4 list-disc">{plan.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Alimentos permitidos/proibidos */}
      <section className="mb-6 fade-up">
        <div className="edition-tag mb-3">Alimentos</div>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar alimento…" className="input-field mb-3" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <FoodBox title="Permitidos" icon={<Check size={14} />} color="#166534" bg="#dcfce7"
            items={filter([...(plan?.allowedTreats ?? []), ...KNOWN.allowed])} />
          <FoodBox title="Moderação" icon={<AlertTriangle size={14} />} color="#92400e" bg="#fef3c7"
            items={filter(KNOWN.moderate)} />
          <FoodBox title="Proibidos" icon={<X size={14} />} color="#991b1b" bg="#fee2e2"
            items={filter([...(plan?.forbiddenFoods ?? []), ...KNOWN.forbidden])} />
        </div>
      </section>

      {/* Registro de refeições */}
      <section className="mb-6 surface p-5 fade-up">
        <h3 className="mb-3 font-semibold">Registrar refeição</h3>
        <div className="grid grid-cols-2 gap-2">
          <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="input-field">
            <option>Ração seca</option><option>Ração úmida</option><option>Natural</option><option>Petisco</option>
          </select>
          <input value={mealAmount} onChange={(e) => setMealAmount(e.target.value)}
            placeholder="Quantidade (ex.: 150g)" className="input-field" />
        </div>
        <button onClick={saveMeal} className="btn-primary mt-2"><Plus size={14} /> Registrar</button>

        {meals.length > 0 && (
          <div className="mt-4 space-y-2">
            {meals.slice(0, 6).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <div>{m.type} {m.amount && <span style={{ color: "var(--n-500)" }}>· {m.amount}</span>}</div>
                <span className="text-xs" style={{ color: "var(--n-500)" }}>
                  {new Date(m.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function FoodBox({ title, icon, color, bg, items }: { title: string; icon: React.ReactNode; color: string; bg: string; items: string[] }) {
  return (
    <div className="surface p-3">
      <div className="mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: bg, color }}>
        {icon} {title}
      </div>
      {items.length === 0 ? (
        <div className="text-xs" style={{ color: "var(--n-500)" }}>Nenhum resultado</div>
      ) : (
        <ul className="space-y-1 text-sm capitalize">{[...new Set(items)].slice(0, 12).map((i) => <li key={i}>• {i}</li>)}</ul>
      )}
    </div>
  );
}
