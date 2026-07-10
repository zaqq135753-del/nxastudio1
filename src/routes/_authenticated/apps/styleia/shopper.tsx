import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { personalShopper, type ShopperSuggestion } from "@/lib/style.functions";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/styleia/shopper")({
  component: Shopper,
});

const GOALS = [
  "Melhorar looks de trabalho",
  "Ter mais peças coringa",
  "Renovar guarda-roupa",
  "Preparar para viagem",
  "Ocasiões formais",
];

function Shopper() {
  const [goal, setGoal] = useState(GOALS[0]);
  const [budget, setBudget] = useState("médio");
  const [items, setItems] = useState<ShopperSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const fn = useServerFn(personalShopper);

  async function run() {
    setLoading(true);
    try { setItems(await fn({ data: { goal, budget } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="styleia">
      <ScreenHeader title="Personal shopper" subtitle="5 peças-chave pra investir baseado no seu guarda-roupa atual." />

      <div className="surface mb-4 p-4 space-y-3">
        <div>
          <div className="mb-2 text-xs uppercase" style={{ color: "var(--n-500)" }}>Objetivo</div>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button key={g} onClick={() => setGoal(g)} className="chip"
                style={{ background: goal === g ? "var(--c-orange)" : "var(--n-100)", color: goal === g ? "#fff" : "var(--n-700)" }}>{g}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs uppercase" style={{ color: "var(--n-500)" }}>Orçamento</div>
          <div className="flex gap-2">
            {["baixo", "médio", "alto"].map((b) => (
              <button key={b} onClick={() => setBudget(b)} className="chip"
                style={{ background: budget === b ? "var(--c-orange)" : "var(--n-100)", color: budget === b ? "#fff" : "var(--n-700)" }}>{b}</button>
            ))}
          </div>
        </div>
        <button onClick={run} disabled={loading} className="btn-primary">
          <Sparkles size={14} /> {loading ? "Analisando…" : "Sugerir peças"}
        </button>
      </div>

      {items.length > 0 && (
        <div className="stagger space-y-3">
          {items.map((s, i) => (
            <div key={i} className="surface p-4">
              <div className="mb-1 flex items-center justify-between">
                <div className="font-semibold">{s.item}</div>
                <span className="chip chip-neutral">{s.price_range}</span>
              </div>
              <div className="text-sm" style={{ color: "var(--n-500)" }}>{s.why}</div>
              <div className="mt-2 text-xs" style={{ color: "var(--n-500)" }}>
                <b>Onde:</b> {s.where}
              </div>
              {s.combines_with?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.combines_with.map((c, j) => (
                    <span key={j} className="chip chip-neutral text-[10px]">+ {c}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
