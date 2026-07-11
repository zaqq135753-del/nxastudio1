import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { scanReceipt, importReceiptItems, type ScannedReceipt } from "@/lib/grana.functions";
import { Camera, Upload, Receipt, Check } from "lucide-react";
import { toast } from "sonner";
import { PrimeGate } from "@/components/commerce/PrimeGate";

export const Route = createFileRoute("/_authenticated/apps/granaia/scanner")({
  component: () => (
    <AppShell title="Scanner de notas">
      <PrimeGate slug="granaia" feature="Scanner de nota fiscal">
        <Scanner />
      </PrimeGate>
    </AppShell>
  ),
});

function Scanner() {
  const navigate = useNavigate();
  const call = useServerFn(scanReceipt);
  const importCall = useServerFn(importReceiptItems);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScannedReceipt | null>(null);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(file: File) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result as string;
      setPreview(b64); setLoading(true); setResult(null);
      try { setResult(await call({ data: { imageBase64: b64 } })); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  }

  async function importAll() {
    if (!result?.items.length) return;
    setImporting(true);
    try {
      const r = await importCall({ data: { items: result.items, date: result.date ?? undefined } });
      toast.success(`${r.count} transações importadas`);
      navigate({ to: "/apps/granaia/transacoes" });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setImporting(false); }
  }

  return (
    <AppShell appSlug="granaia">
      <ScreenHeader title="Scanner de comprovante" subtitle="Foto da nota fiscal → transações no seu financeiro" />

      {!preview && (
        <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center space-y-4">
          <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Envie a foto do cupom, extrato ou comprovante</p>
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
          <img src={preview} alt="" className="rounded-3xl w-full object-contain max-h-[420px] bg-muted/30" />
          <div className="rounded-3xl surface p-5 space-y-4">
            {loading && <TypingIndicator label="Lendo comprovante…" />}
            {result && (
              <>
                <div>
                  <div className="text-lg font-semibold">{result.merchant ?? "Estabelecimento desconhecido"}</div>
                  <div className="text-xs text-muted-foreground">{result.date ?? "sem data"}</div>
                </div>
                <div className="rounded-2xl bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold">R$ {(result.total ?? 0).toFixed(2)}</div>
                </div>
                <ul className="space-y-1.5 max-h-[220px] overflow-y-auto">
                  {result.items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-sm">
                      <div>
                        <div className="font-medium">{it.description}</div>
                        <div className="text-xs text-muted-foreground">{it.category}</div>
                      </div>
                      <span>R$ {it.amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <button onClick={() => { setPreview(null); setResult(null); }}
                    className="flex-1 rounded-2xl border border-border/60 py-2.5 text-sm">Cancelar</button>
                  <button onClick={importAll} disabled={importing || result.items.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-50">
                    <Check className="h-4 w-4" /> {importing ? "Importando…" : "Importar tudo"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
