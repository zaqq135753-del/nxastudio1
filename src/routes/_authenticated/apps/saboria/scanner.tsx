import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { scanPantryPhoto, type PantryScanResult } from "@/lib/ai.functions";
import { Camera, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/saboria/scanner")({
  component: Scanner,
});

function Scanner() {
  const call = useServerFn(scanPantryPhoto);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PantryScanResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(file: File) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result as string;
      setPreview(b64); setLoading(true); setResult(null);
      try {
        const r = await call({ data: { imageBase64: b64 } });
        setResult(r);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao analisar");
      } finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  }

  return (
    <AppShell appSlug="saboria">
      <ScreenHeader title="Scanner de compras" subtitle="Foto do saco/geladeira → itens catalogados por IA" />

      {!preview && (
        <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center space-y-4">
          <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Tire ou envie uma foto dos alimentos</p>
          <input ref={inputRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={e => e.target.files?.[0] && pick(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium">
            <Upload className="h-4 w-4" /> Enviar foto
          </button>
        </div>
      )}

      {preview && (
        <div className="grid gap-4 md:grid-cols-2">
          <img src={preview} alt="" className="rounded-3xl w-full object-cover max-h-[360px]" />
          <div className="rounded-3xl surface p-5">
            {loading && <TypingIndicator label="Analisando alimentos…" />}
            {result && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" /> {result.items.length} itens identificados
                </div>
                <p className="text-xs text-muted-foreground">{result.note}</p>
                <ul className="space-y-1.5 max-h-[280px] overflow-y-auto">
                  {result.items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm">
                      <span className="capitalize">{it.name}</span>
                      <span className="text-xs text-muted-foreground">{it.qty ?? ""} · {it.category ?? ""}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => { setPreview(null); setResult(null); }}
                  className="w-full rounded-2xl border border-border/60 py-2 text-sm">Nova foto</button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
