import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { selectPlan } from "@/lib/paywall.functions";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/planos")({
  component: Planos,
});

const PLANS = [
  {
    id: "pro_3" as const,
    name: "Pro 3",
    price: "R$ 49",
    period: "/mês",
    tagline: "Escolha 3 apps",
    features: ["3 apps à sua escolha", "IA ilimitada nos 3 apps", "Voz global NXA", "Memória cross-app"],
  },
  {
    id: "pro_all" as const,
    name: "Pro Tudo",
    price: "R$ 89",
    period: "/mês",
    tagline: "Suite completa",
    features: ["Todos os 10 apps NXA", "IA ilimitada em tudo", "Concierge proativo", "Novos apps automaticamente"],
    highlight: true,
  },
];

function Planos() {
  const navigate = useNavigate();
  const choose = useServerFn(selectPlan);
  const [loading, setLoading] = useState<string | null>(null);

  async function pick(plan: "pro_3" | "pro_all") {
    setLoading(plan);
    try {
      await choose({ data: { plan } });
      navigate({ to: "/hub" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> NXA Studio
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Escolha seu plano</h1>
          <p className="text-muted-foreground">Cancele quando quiser. 7 dias de trial já inclusos.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {PLANS.map(p => (
            <div
              key={p.id}
              className={`relative rounded-3xl border p-8 ${
                p.highlight ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border/60 bg-card/60"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Mais escolhido
                </div>
              )}
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">{p.tagline}</div>
                <div className="text-2xl font-semibold">{p.name}</div>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                  <span className="text-muted-foreground">{p.period}</span>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => pick(p.id)}
                disabled={loading !== null}
                className={`mt-8 w-full rounded-2xl py-3 font-medium transition-all ${
                  p.highlight
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-foreground text-background hover:opacity-90"
                } disabled:opacity-50`}
              >
                {loading === p.id ? "Ativando…" : "Escolher"}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Pagamento seguro será ativado em breve — por enquanto, o plano é registrado sem cobrança.
          <br />
          Quer ganhar dinheiro indicando? <a href="/afiliados" className="underline">Programa de afiliados →</a>
        </p>
      </div>
    </div>
  );
}
