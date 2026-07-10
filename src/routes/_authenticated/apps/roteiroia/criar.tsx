import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { createItinerary, type Itinerary } from "@/lib/travel.functions";
import { Plane } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/roteiroia/criar")({
  component: CriarPage,
});

const STYLES = ["equilibrado", "econômico", "luxo", "aventura", "romântico", "família"];
const INTERESTS = ["Gastronomia", "História", "Praia", "Trilhas", "Museus", "Vida noturna", "Compras", "Natureza"];

function CriarPage() {
  const nav = useNavigate();
  const [f, setF] = useState({
    destination: "", start_date: "", days_count: 5, travelers: 2, budget_brl: "" as string,
    style: "equilibrado", interests: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Itinerary | null>(null);
  const create = useServerFn(createItinerary);

  function toggle(v: string) {
    setF((p) => ({ ...p, interests: p.interests.includes(v) ? p.interests.filter((x) => x !== v) : [...p.interests, v] }));
  }

  async function submit() {
    if (!f.destination) return toast.error("Informe o destino.");
    setLoading(true);
    try {
      const r = await create({
        data: {
          destination: f.destination,
          start_date: f.start_date || undefined,
          days_count: f.days_count,
          travelers: f.travelers,
          budget_brl: f.budget_brl ? Number(f.budget_brl) : undefined,
          style: f.style,
          interests: f.interests,
        },
      });
      setResult(r.itinerary);
      toast.success("Roteiro criado!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="roteiroia">
      <ScreenHeader title="Criar roteiro" subtitle="Conte o essencial, a IA planeja tudo." />

      {!result ? (
        <div className="surface space-y-4 p-5">
          <Field label="Destino *">
            <input value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })} placeholder="Lisboa, Portugal" className="input-field w-full" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Início">
              <input type="date" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} className="input-field w-full" />
            </Field>
            <Field label="Dias">
              <input type="number" min={1} max={30} value={f.days_count} onChange={(e) => setF({ ...f, days_count: Number(e.target.value) })} className="input-field w-full" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Viajantes">
              <input type="number" min={1} value={f.travelers} onChange={(e) => setF({ ...f, travelers: Number(e.target.value) })} className="input-field w-full" />
            </Field>
            <Field label="Orçamento total (R$)">
              <input type="number" value={f.budget_brl} onChange={(e) => setF({ ...f, budget_brl: e.target.value })} placeholder="opcional" className="input-field w-full" />
            </Field>
          </div>

          <Field label="Estilo">
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button key={s} onClick={() => setF({ ...f, style: s })} className="chip"
                  style={{ background: f.style === s ? "var(--c-orange)" : "var(--n-100)", color: f.style === s ? "#fff" : "var(--n-700)" }}>{s}</button>
              ))}
            </div>
          </Field>

          <Field label="Interesses">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button key={i} onClick={() => toggle(i)} className="chip"
                  style={{ background: f.interests.includes(i) ? "var(--c-orange)" : "var(--n-100)", color: f.interests.includes(i) ? "#fff" : "var(--n-700)" }}>{i}</button>
              ))}
            </div>
          </Field>

          <button onClick={submit} disabled={loading} className="btn-primary">
            <Plane size={14} /> {loading ? "Planejando sua viagem…" : "Gerar roteiro"}
          </button>
        </div>
      ) : (
        <div className="fade-up space-y-4">
          <div className="surface p-5">
            <div className="edition-tag mb-2">{result.destination}</div>
            <p className="text-sm mb-3">{result.overview}</p>
            <div className="text-xs" style={{ color: "var(--n-500)" }}>🗓️ {result.best_time_to_visit}</div>
          </div>

          <div className="surface p-5">
            <div className="edition-tag mb-3">💰 Orçamento estimado</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <BudgetRow label="✈️ Voos" v={result.budget_breakdown.flights_brl} />
              <BudgetRow label="🏨 Hospedagem" v={result.budget_breakdown.lodging_brl} />
              <BudgetRow label="🍽️ Alimentação" v={result.budget_breakdown.food_brl} />
              <BudgetRow label="🎫 Atrações" v={result.budget_breakdown.attractions_brl} />
              <BudgetRow label="🚗 Transporte" v={result.budget_breakdown.transport_brl} />
              <BudgetRow label="✨ Extras" v={result.budget_breakdown.extras_brl} />
            </div>
            <div className="mt-3 border-t pt-3 text-right font-bold" style={{ borderColor: "var(--n-100)" }}>
              Total: R$ {result.budget_breakdown.total_brl.toLocaleString("pt-BR")}
            </div>
          </div>

          {result.days.map((d) => (
            <div key={d.day} className="surface p-5">
              <div className="flex items-center justify-between">
                <div className="edition-tag">Dia {d.day} · {d.theme}</div>
                <div className="text-xs" style={{ color: "var(--n-500)" }}>R$ {d.daily_total_brl}</div>
              </div>
              <div className="mt-3 space-y-3">
                {d.activities.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-14 shrink-0 text-xs font-semibold" style={{ color: "var(--c-orange)" }}>{a.time}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="text-xs" style={{ color: "var(--n-500)" }}>{a.description}</div>
                      {a.tip && <div className="mt-1 text-xs italic" style={{ color: "var(--n-500)" }}>💡 {a.tip}</div>}
                      <div className="mt-1 text-xs">R$ {a.estimated_cost_brl}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="surface p-5">
              <div className="edition-tag mb-2">🎒 Pra levar</div>
              <ul className="space-y-1 text-sm">{result.packing_tips.map((t, i) => <li key={i}>• {t}</li>)}</ul>
            </div>
            <div className="surface p-5">
              <div className="edition-tag mb-2">🗣️ Dicas locais</div>
              <ul className="space-y-1 text-sm">{result.local_tips.map((t, i) => <li key={i}>• {t}</li>)}</ul>
            </div>
          </div>

          <button onClick={() => nav({ to: "/apps/roteiroia/meus" })} className="btn-primary">
            Ver minhas viagens salvas
          </button>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase" style={{ color: "var(--n-500)" }}>{label}</div>
      {children}
    </div>
  );
}

function BudgetRow({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: "var(--n-500)" }}>{label}</span>
      <span>R$ {v.toLocaleString("pt-BR")}</span>
    </div>
  );
}
