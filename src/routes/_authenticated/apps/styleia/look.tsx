import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { generateLook, saveLook, type Look } from "@/lib/style.functions";
import { Wand2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/styleia/look")({
  component: LookPage,
});

const OCCASIONS = ["Trabalho", "Casual", "Balada", "Encontro", "Academia", "Formal", "Praia", "Viagem"];
const WEATHERS = ["Ensolarado", "Nublado", "Frio", "Chuvoso"];

function LookPage() {
  const [occasion, setOccasion] = useState("Trabalho");
  const [weather, setWeather] = useState("Ensolarado");
  const [look, setLook] = useState<Look | null>(null);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(generateLook);
  const save = useServerFn(saveLook);

  async function generate() {
    setLoading(true);
    try { setLook(await gen({ data: { occasion, weather } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  async function persist() {
    if (!look) return;
    await save({ data: { name: look.name, occasion: look.occasion, description: look.description } });
    toast.success("Look salvo");
  }

  return (
    <AppShell appSlug="styleia">
      <ScreenHeader title="Montar look" subtitle="IA sugere um look com base no seu perfil e guarda-roupa." />

      <div className="surface mb-4 p-4">
        <div className="mb-3">
          <div className="mb-2 text-xs uppercase" style={{ color: "var(--n-500)" }}>Ocasião</div>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button key={o} onClick={() => setOccasion(o)} className="chip"
                style={{ background: occasion === o ? "var(--c-orange)" : "var(--n-100)", color: occasion === o ? "#fff" : "var(--n-700)" }}>{o}</button>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <div className="mb-2 text-xs uppercase" style={{ color: "var(--n-500)" }}>Clima</div>
          <div className="flex flex-wrap gap-2">
            {WEATHERS.map((w) => (
              <button key={w} onClick={() => setWeather(w)} className="chip"
                style={{ background: weather === w ? "var(--c-orange)" : "var(--n-100)", color: weather === w ? "#fff" : "var(--n-700)" }}>{w}</button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary">
          <Wand2 size={14} /> {loading ? "Montando…" : "Gerar look"}
        </button>
      </div>

      {look && (
        <div className="surface p-5 fade-up">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold tracking-tight">{look.name}</div>
              <div className="text-xs" style={{ color: "var(--n-500)" }}>{look.occasion}</div>
            </div>
            <button onClick={persist} className="chip chip-neutral"><Save size={12} className="mr-1 inline" />Salvar</button>
          </div>
          <p className="mb-4 text-sm" style={{ color: "var(--n-500)" }}>{look.description}</p>
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {look.pieces.map((p, i) => (
              <div key={i} className="rounded-xl border p-3" style={{ borderColor: "var(--line-1)" }}>
                <div className="text-xs uppercase" style={{ color: "var(--n-500)" }}>{p.category}</div>
                <div className="text-sm font-medium">{p.description}</div>
                <div className="text-xs" style={{ color: "var(--n-500)" }}>{p.color}</div>
              </div>
            ))}
          </div>
          {look.tips?.length > 0 && (
            <div className="rounded-xl p-3 text-sm" style={{ background: "var(--n-100)" }}>
              <div className="mb-1 text-xs font-semibold uppercase" style={{ color: "var(--n-500)" }}>Dicas de estilo</div>
              <ul className="space-y-1">{look.tips.map((t, i) => <li key={i}>• {t}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
