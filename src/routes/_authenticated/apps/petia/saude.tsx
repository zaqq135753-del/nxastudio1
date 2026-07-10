import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { usePets } from "@/hooks/use-pets";
import {
  addHealthRecord, listHealth, addVaccination, listVaccinations,
  healthReport, type HealthReport,
} from "@/lib/pet.functions";
import { Plus, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/petia/saude")({
  component: SaudePage,
});

type HRow = { id: string; record_date: string; weight: number | null; notes: string | null };
type Vac = { id: string; name: string; applied_on: string; next_booster: string | null };

function SaudePage() {
  const { active } = usePets();
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<HRow[]>([]);
  const [vacs, setVacs] = useState<Vac[]>([]);
  const [vName, setVName] = useState("");
  const [vDate, setVDate] = useState("");
  const [vNext, setVNext] = useState("");
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const addH = useServerFn(addHealthRecord);
  const listH = useServerFn(listHealth);
  const addV = useServerFn(addVaccination);
  const listV = useServerFn(listVaccinations);
  const genReport = useServerFn(healthReport);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const [h, v] = await Promise.all([
        listH({ data: { petId: active.id } }),
        listV({ data: { petId: active.id } }),
      ]);
      setHistory(h as HRow[]); setVacs(v as Vac[]);
    })();
  }, [active, listH, listV]);

  async function saveRecord() {
    if (!active) return;
    const w = parseFloat(weight);
    await addH({ data: { petId: active.id, weight: isNaN(w) ? undefined : w, notes } });
    setWeight(""); setNotes("");
    setHistory(await listH({ data: { petId: active.id } }) as HRow[]);
    toast.success("Registro salvo");
  }

  async function saveVac() {
    if (!active || !vName || !vDate) return toast.error("Preencha vacina e data");
    await addV({ data: { petId: active.id, name: vName, applied_on: vDate, next_booster: vNext || undefined } });
    setVName(""); setVDate(""); setVNext("");
    setVacs(await listV({ data: { petId: active.id } }) as Vac[]);
    toast.success("Vacina registrada");
  }

  async function doReport() {
    if (!active) return;
    setLoadingReport(true);
    try { setReport(await genReport({ data: { petId: active.id } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoadingReport(false); }
  }

  // Weight change alert
  const alert = (() => {
    if (history.length < 2) return null;
    const latest = history[0].weight; const older = history[history.length - 1].weight;
    if (!latest || !older) return null;
    const diff = ((latest - older) / older) * 100;
    if (Math.abs(diff) > 10) return `⚠️ Variação de ${diff.toFixed(1)}% no peso — considere consultar o vet.`;
    return null;
  })();

  if (!active) return <AppShell appSlug="petia"><div className="pt-16 text-center text-sm">Cadastre um pet primeiro.</div></AppShell>;

  return (
    <AppShell appSlug="petia">
      <ScreenHeader title="Saúde de " subtitle="Peso, vacinas e relatório veterinário." />

      {/* Registro de peso */}
      <section className="mb-6 surface p-5 fade-up">
        <h3 className="mb-3 font-semibold">Novo registro</h3>
        <div className="grid grid-cols-2 gap-2">
          <input value={weight} onChange={(e) => setWeight(e.target.value)}
            placeholder="Peso (kg)" type="number" step="0.1" className="input-field" />
          <button onClick={saveRecord} className="btn-primary"><Plus size={14} /> Registrar</button>
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações (opcional)" className="input-field mt-2 min-h-[80px]" />
        {alert && <div className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: "#fef3c7", color: "#92400e" }}>{alert}</div>}
      </section>

      {/* Histórico */}
      {history.length > 0 && (
        <section className="mb-6 fade-up">
          <div className="edition-tag mb-3">Histórico</div>
          <div className="space-y-2">
            {history.slice(0, 8).map((h) => (
              <div key={h.id} className="surface flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="font-medium">{h.weight ? `${h.weight} kg` : "—"}</div>
                  {h.notes && <div className="text-xs" style={{ color: "var(--n-500)" }}>{h.notes}</div>}
                </div>
                <div className="text-xs" style={{ color: "var(--n-500)" }}>
                  {new Date(h.record_date).toLocaleDateString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vacinas */}
      <section className="mb-6 surface p-5 fade-up">
        <h3 className="mb-3 font-semibold">Nova vacina</h3>
        <div className="space-y-2">
          <input value={vName} onChange={(e) => setVName(e.target.value)}
            placeholder="Nome (ex.: V10, Antirrábica)" className="input-field" />
          <div className="grid grid-cols-2 gap-2">
            <input value={vDate} onChange={(e) => setVDate(e.target.value)}
              type="date" className="input-field" />
            <input value={vNext} onChange={(e) => setVNext(e.target.value)}
              type="date" placeholder="Próximo reforço" className="input-field" />
          </div>
          <button onClick={saveVac} className="btn-primary"><Plus size={14} /> Adicionar</button>
        </div>
      </section>

      {vacs.length > 0 && (
        <section className="mb-6 fade-up">
          <div className="edition-tag mb-3">Calendário de vacinas</div>
          <div className="space-y-2">
            {vacs.map((v) => {
              const late = v.next_booster && new Date(v.next_booster) < new Date();
              return (
                <div key={v.id} className="surface flex items-center justify-between p-3 text-sm">
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs" style={{ color: "var(--n-500)" }}>
                      Aplicada em {new Date(v.applied_on).toLocaleDateString("pt-BR")}
                      {v.next_booster && ` · reforço ${new Date(v.next_booster).toLocaleDateString("pt-BR")}`}
                    </div>
                  </div>
                  <span className="chip chip-neutral">{late ? "⚠️ Atrasada" : "✅ Em dia"}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Relatório */}
      <section className="mb-6 fade-up">
        <div className="edition-tag mb-3">Relatório para veterinário</div>
        <div className="surface p-5">
          <p className="mb-3 text-sm" style={{ color: "var(--n-500)" }}>
            A IA compila o histórico de peso, vacinas e observações em um resumo profissional.
          </p>
          <button onClick={doReport} disabled={loadingReport} className="btn-primary">
            <Sparkles size={14} /> {loadingReport ? "Gerando…" : "Gerar relatório"}
          </button>
          {report && (
            <div className="mt-4 space-y-3 text-sm">
              <Block title="Resumo" body={report.summary} />
              <Block title="Análise de peso" body={report.weightAnalysis} />
              <Block title="Status vacinal" body={report.vaccinationStatus} />
              {report.concerns.length > 0 && <List title="Pontos de atenção" items={report.concerns} />}
              {report.recommendations.length > 0 && <List title="Recomendações" items={report.recommendations} />}
              <button onClick={() => window.print()} className="chip chip-neutral">
                <FileText size={12} className="mr-1 inline" />Imprimir / PDF
              </button>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>{title}</div>
      <p className="mt-0.5">{body}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>{title}</div>
      <ul className="mt-1 ml-4 list-disc">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}
