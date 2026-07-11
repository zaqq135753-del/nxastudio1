import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { analyzeSkin, type SkinDiagnosis } from "@/lib/glow.functions";
import { Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PrimeGate } from "@/components/commerce/PrimeGate";

export const Route = createFileRoute("/_authenticated/apps/glowia/analise")({
  component: () => (
    <AppShell>
      <PrimeGate slug="glowia" feature="Análise de pele com IA">
        <AnalisePage />
      </PrimeGate>
    </AppShell>
  ),
});

function AnalisePage() {
  const [symptoms, setSymptoms] = useState("");
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [result, setResult] = useState<SkinDiagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const analyze = useServerFn(analyzeSkin);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function run() {
    if (!symptoms.trim() && !imageBase64) return toast.error("Envie uma foto ou descreva sua pele.");
    setLoading(true);
    try {
      const res = await analyze({ data: { symptoms, imageBase64 } });
      setResult(res);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="glowia">
      <ScreenHeader title="Análise de pele" subtitle="Diagnóstico com IA baseado em foto e sintomas." />

      <div className="surface p-5 space-y-3 mb-6">
        <label className="block">
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--n-500)" }}>Foto (opcional)</div>
          <div className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer" style={{ borderColor: "var(--line-1)" }}>
            {imageBase64 ? (
              <img src={imageBase64} alt="preview" className="mx-auto max-h-48 rounded-lg" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-sm" style={{ color: "var(--n-500)" }}>
                <Camera size={24} /> Toque para enviar
              </div>
            )}
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </div>
        </label>

        <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
          rows={4} placeholder="O que está te incomodando? Ex.: espinhas na testa, oleosidade excessiva…"
          className="input-field w-full" />

        <button onClick={run} disabled={loading} className="btn-primary">
          <Sparkles size={14} /> {loading ? "Analisando…" : "Analisar minha pele"}
        </button>
      </div>

      {result && (
        <div className="surface p-5 fade-up space-y-4">
          <div>
            <div className="edition-tag mb-1">Resumo</div>
            <p className="text-sm">{result.summary}</p>
          </div>
          <Block title="Preocupações identificadas" items={result.concerns} />
          <div>
            <div className="edition-tag mb-2">Recomendações</div>
            <ul className="space-y-2 text-sm">
              {result.recommendations?.map((r, i) => (
                <li key={i} className="rounded-lg p-2" style={{ background: "var(--n-100)" }}>
                  <b>{r.step}</b> <span style={{ color: "var(--n-500)" }}>— {r.why}</span>
                </li>
              ))}
            </ul>
          </div>
          <Block title="Ingredientes recomendados" items={result.ingredientsToUse} />
          <Block title="Evite" items={result.ingredientsToAvoid} danger />
        </div>
      )}
    </AppShell>
  );
}

function Block({ title, items, danger }: { title: string; items: string[]; danger?: boolean }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="edition-tag mb-2">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((i, k) => (
          <span key={k} className="chip" style={{ background: danger ? "rgba(239,68,68,0.1)" : "var(--n-100)" }}>{i}</span>
        ))}
      </div>
    </div>
  );
}
