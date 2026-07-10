import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { financialSummary, financialInsights, type FinancialInsight } from "@/lib/grana.functions";
import { Receipt, MessageCircle, Target, ArrowRight, Sparkles, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import coverImg from "@/assets/cover-granaia.jpg";

export const Route = createFileRoute("/_authenticated/apps/granaia/")({
  component: GranaHome,
});

const quick = [
  { to: "/apps/granaia/comprar" as const, icon: ShoppingBag, title: "Posso comprar?", desc: "Análise honesta em 5s" },
  { to: "/apps/granaia/transacoes" as const, icon: Receipt, title: "Transações", desc: "Receitas e gastos" },
  { to: "/apps/granaia/chat" as const, icon: MessageCircle, title: "Chat IA", desc: "Consultor 24h" },
  { to: "/apps/granaia/metas" as const, icon: Target, title: "Metas", desc: "Objetivos e progresso" },
];

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function GranaHome() {
  const [sum, setSum] = useState({ income: 0, expense: 0, balance: 0, byCategory: {} as Record<string, number>, count: 0 });
  const [insight, setInsight] = useState<FinancialInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSum = useServerFn(financialSummary);
  const fetchIns = useServerFn(financialInsights);

  useEffect(() => { fetchSum().then(setSum); }, [fetchSum]);

  async function loadInsights() {
    setLoading(true);
    try { setInsight(await fetchIns()); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  const categories = Object.entries(sum.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalExp = sum.expense || 1;

  return (
    <AppShell appSlug="granaia">
      <ScreenHeader title="💰 NXA Money" subtitle="Seu consultor financeiro pessoal com IA." />

      <div className="surface p-5 mb-6 fade-up">
        <div className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>Saldo do mês</div>
        <div className="mt-1 text-3xl font-bold tracking-tight" style={{ color: sum.balance >= 0 ? "var(--c-green, #16a34a)" : "var(--c-red, #dc2626)" }}>
          {fmt(sum.balance)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div><div style={{ color: "var(--n-500)" }}>Receitas</div><div className="font-semibold">{fmt(sum.income)}</div></div>
          <div><div style={{ color: "var(--n-500)" }}>Gastos</div><div className="font-semibold">{fmt(sum.expense)}</div></div>
        </div>
      </div>

      {categories.length > 0 && (
        <section className="mb-6 fade-up">
          <div className="edition-tag mb-2">Onde vai seu dinheiro</div>
          <div className="surface p-4 space-y-2">
            {categories.map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat}</span>
                  <span style={{ color: "var(--n-500)" }}>{fmt(val)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full" style={{ background: "var(--n-100)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(val / totalExp) * 100}%`, background: "var(--c-orange)" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6 fade-up">
        <div className="edition-tag mb-2">Insights da IA</div>
        <div className="surface p-5">
          {insight ? (
            <div className="space-y-3 text-sm">
              <p>{insight.summary}</p>
              {insight.alerts?.length > 0 && (
                <div>
                  <div className="font-semibold mb-1">⚠️ Alertas</div>
                  <ul className="space-y-1" style={{ color: "var(--n-500)" }}>
                    {insight.alerts.map((a, i) => <li key={i}>• {a}</li>)}
                  </ul>
                </div>
              )}
              {insight.savings?.length > 0 && (
                <div>
                  <div className="font-semibold mb-1">💡 Oportunidades</div>
                  <ul className="space-y-1" style={{ color: "var(--n-500)" }}>
                    {insight.savings.map((a, i) => <li key={i}>• {a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm" style={{ color: "var(--n-500)" }}>Descubra padrões e oportunidades de economia.</div>
          )}
          <button onClick={loadInsights} disabled={loading} className="btn-primary mt-4">
            <Sparkles size={14} /> {loading ? "Analisando…" : insight ? "Atualizar insights" : "Gerar insights"}
          </button>
        </div>
      </section>

      <section className="stagger grid grid-cols-1 gap-3 sm:grid-cols-3">
        {quick.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="tile-hero tile-cover"
            style={{ ["--tile-img" as string]: `url(${coverImg})` } as CSSProperties}
          >
            <div className="flex items-start justify-between">
              <div className="tile-icon-wrap"><q.icon size={20} /></div>
              <ArrowRight size={14} className="tile-arrow" />
            </div>
            <div className="mt-2">
              <div className="tile-title">{q.title}</div>
              <div className="tile-desc">{q.desc}</div>
            </div>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
