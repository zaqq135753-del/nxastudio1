import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { symptomTriage, listPets, type TriageResult } from "@/lib/pet.functions";
import { AlertTriangle, Stethoscope, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/petia/triagem")({
  component: Triagem,
});

const COMMON = ["vômito", "diarreia", "apatia", "sem apetite", "mancando", "coçando muito", "tosse", "espirros", "olho vermelho", "sangramento", "convulsão", "dificuldade pra respirar"];

type Pet = { id: string; name: string; type: string; birth_date?: string | null };

function Triagem() {
  const load = useServerFn(listPets);
  const call = useServerFn(symptomTriage);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selected, setSelected] = useState<Pet | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  useEffect(() => { load().then((r) => { setPets(r as Pet[]); if (r?.[0]) setSelected(r[0] as Pet); }).catch(() => {}); }, [load]);

  function toggle(s: string) {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function analyze() {
    if (symptoms.length === 0) { toast.error("Selecione ao menos um sintoma"); return; }
    setLoading(true); setResult(null);
    try {
      const r = await call({ data: {
        species: selected?.species ?? "cão",
        age: selected?.birth_date ?? undefined,
        symptoms, notes: notes || undefined,
        pet_id: selected?.id,
      }});
      setResult(r);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  const urgencyColor = result?.urgency === "emergency" ? "bg-red-500/10 border-red-500/40 text-red-600"
    : result?.urgency === "urgent" ? "bg-orange-500/10 border-orange-500/40 text-orange-600"
    : result?.urgency === "monitor" ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-700"
    : "bg-green-500/10 border-green-500/40 text-green-700";

  return (
    <AppShell appSlug="petia">
      <ScreenHeader title="Triagem de sintomas" subtitle="Descreva o que você observou — a IA indica o nível de urgência" />

      {pets.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {pets.map(p => (
            <button key={p.id} onClick={() => setSelected(p)}
              className={`rounded-full border px-3 py-1.5 text-sm whitespace-nowrap ${selected?.id === p.id ? "bg-primary text-primary-foreground border-primary" : "bg-card/60 border-border/60"}`}>
              {p.name} · {p.species}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-3xl surface p-5 space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Sintomas observados</div>
          <div className="flex flex-wrap gap-2">
            {COMMON.map(s => (
              <button key={s} onClick={() => toggle(s)}
                className={`rounded-full border px-3 py-1.5 text-xs ${symptoms.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-card/60 border-border/60"}`}>
                {s}
                {symptoms.includes(s) && <X className="ml-1 inline h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Observações (opcional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Há quanto tempo? mudou alguma coisa em casa? comeu algo diferente?"
            className="mt-1 w-full rounded-2xl border border-border/60 bg-background p-3 text-sm" />
        </div>
        <button onClick={analyze} disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3 font-medium disabled:opacity-50">
          <Stethoscope className="h-4 w-4" /> {loading ? "Analisando…" : "Fazer triagem"}
        </button>
      </div>

      {loading && <div className="mt-4"><TypingIndicator label="Avaliando urgência…" /></div>}

      {result && (
        <div className="mt-4 space-y-4">
          <div className={`rounded-3xl border-2 p-5 ${urgencyColor}`}>
            <div className="flex items-center gap-2 text-lg font-bold">
              <AlertTriangle className="h-5 w-5" /> {result.urgency_label}
            </div>
            <p className="mt-2 text-sm opacity-90">{result.reasoning}</p>
          </div>

          <div className="rounded-3xl surface p-5">
            <div className="text-sm font-semibold mb-2">Próximos passos</div>
            <ol className="space-y-2 text-sm list-decimal ml-5">
              {result.next_steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>

          {result.home_care.length > 0 && (
            <div className="rounded-3xl surface p-5">
              <div className="text-sm font-semibold mb-2">Cuidados em casa</div>
              <ul className="space-y-1.5 text-sm">
                {result.home_care.map((s, i) => <li key={i}>· {s}</li>)}
              </ul>
            </div>
          )}

          <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4 text-xs text-muted-foreground">
            <strong className="text-red-600">⚠️ Procure o veterinário se:</strong> {result.when_to_vet}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Triagem informativa — nunca substitui uma consulta veterinária.
          </p>
        </div>
      )}
    </AppShell>
  );
}
