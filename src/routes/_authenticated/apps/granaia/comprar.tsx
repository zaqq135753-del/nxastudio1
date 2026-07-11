import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { AIResult, AuroraBackdrop } from "@/components/ui/ai-result";
import { canIBuy, type PurchaseAdvice } from "@/lib/grana.functions";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check, Clock, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PrimeGate } from "@/components/commerce/PrimeGate";

export const Route = createFileRoute("/_authenticated/apps/granaia/comprar")({
  component: () => (
    <AppShell>
      <PrimeGate slug="granaia" feature="Consultor de compras">
        <Page />
      </PrimeGate>
    </AppShell>
  ),
});

const VERDICT = {
  sim:    { label: "Sim, pode comprar", icon: Check,        color: "text-emerald-500", bg: "bg-emerald-500/10" },
  pode:   { label: "Pode, com cuidado", icon: Check,        color: "text-primary",     bg: "bg-primary/10"     },
  espere: { label: "Espere um pouco",   icon: Clock,        color: "text-amber-500",   bg: "bg-amber-500/10"   },
  nao:    { label: "Melhor não agora",  icon: X,            color: "text-rose-500",    bg: "bg-rose-500/10"    },
} as const;

function Page() {
  const call = useServerFn(canIBuy);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [urgency, setUrgency] = useState<"baixa"|"media"|"alta">("media");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<PurchaseAdvice | null>(null);

  async function run() {
    const n = parseFloat(amount.replace(",", "."));
    if (!item.trim() || !n || n <= 0) return toast.error("Preencha item e valor.");
    setLoading(true); setRes(null);
    try { setRes(await call({ data: { item: item.trim(), amount: n, urgency } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  const V = res ? VERDICT[res.verdict] : null;

  return (
    <AppShell appSlug="granaia">
      <AuroraBackdrop />
      <ScreenHeader title="Posso comprar?" subtitle="Análise honesta com base no seu fluxo real." />

      <div className="glass-card p-5 space-y-4 animate-fade-in">
        <div>
          <label className="text-sm font-medium mb-2 block">O que você quer comprar?</label>
          <input value={item} onChange={e=>setItem(e.target.value)}
            placeholder="ex.: fone bluetooth, curso, jantar fora…"
            className="w-full rounded-xl bg-background/60 border border-border/50 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Valor (R$)</label>
          <input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal"
            placeholder="0,00"
            className="w-full rounded-xl bg-background/60 border border-border/50 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Urgência</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["baixa","media","alta"] as const).map(u=>(
              <button key={u} onClick={()=>setUrgency(u)}
                className={`rounded-lg py-2 text-sm font-medium transition ${urgency===u?"bg-primary text-primary-foreground":"bg-muted/50 hover:bg-muted"}`}>
                {u}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={run} disabled={loading} className="w-full press">
          <ShoppingBag className="w-4 h-4 mr-2"/>{loading?"Analisando…":"Devo comprar?"}
        </Button>
      </div>

      {loading && <div className="mt-6"><TypingIndicator label="Rodando os números…"/></div>}

      {res && V && (
        <div className="mt-6 animate-fade-in">
          <AIResult title={V.label} badge={res.verdict.toUpperCase()} icon={<V.icon className="w-5 h-5 text-white"/>}>
            <p className={`text-lg font-semibold mb-4 ${V.color}`}>{res.headline}</p>

            <div className="mb-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Motivos</div>
              <ul className="space-y-1.5 text-sm">
                {res.reasoning.map((r,i)=><li key={i} className="flex gap-2"><span className="text-primary">•</span>{r}</li>)}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className={`rounded-xl p-3 ${V.bg}`}>
                <div className="text-xs uppercase text-muted-foreground mb-1">Impacto no mês</div>
                <div className="text-sm">{res.impact.on_month}</div>
              </div>
              <div className={`rounded-xl p-3 ${V.bg}`}>
                <div className="text-xs uppercase text-muted-foreground mb-1">Impacto nas metas</div>
                <div className="text-sm">{res.impact.on_goals}</div>
              </div>
            </div>

            {res.alternatives?.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5"/>Alternativas
                </div>
                <ul className="space-y-1 text-sm">
                  {res.alternatives.map((a,i)=><li key={i} className="flex gap-2"><span className="text-primary">→</span>{a}</li>)}
                </ul>
              </div>
            )}
          </AIResult>
        </div>
      )}
    </AppShell>
  );
}
