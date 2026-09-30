import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFunnelMetrics, type FunnelMetrics } from "@/lib/funnel.functions";
import { Users, MousePointerClick, ChefHat, Sparkles, AlertCircle, TrendingUp, RefreshCw, Eye } from "lucide-react";

export function AdminFunnelTab() {
  const fetchMetrics = useServerFn(getFunnelMetrics);
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // atualiza a cada 15s
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
        <RefreshCw size={20} className="animate-spin text-emerald-400 mr-2" />
        Carregando telemetria do funil em tempo real…
      </div>
    );
  }

  const m = metrics ?? {
    totalVisitors: 0,
    scroll25: 0,
    scroll50: 0,
    scroll75: 0,
    scroll100: 0,
    simGenerations: 0,
    recipeExpands: 0,
    nutriMessages: 0,
    checkoutClicks: 0,
    checkoutClicksByCta: {},
    topIngredients: [],
    dropoffStage: { heroBounce: 0, afterSim: 0, beforeCheckout: 0 },
    recentEvents: [],
  };

  const conversionRate = m.totalVisitors > 0 
    ? ((m.checkoutClicks / m.totalVisitors) * 100).toFixed(1) 
    : "0.0";

  const simEngagementRate = m.totalVisitors > 0
    ? ((m.simGenerations / m.totalVisitors) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Top Header do Funil */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <TrendingUp size={22} className="text-emerald-400" />
            Trajeto e Conversão do Lead (Presell)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Rastreamento de engajamento, abandono e cliques em tempo real da página oficial.
          </p>
        </div>
        <button
          onClick={load}
          className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Atualizar Dados
        </button>
      </div>

      {/* 4 Cards Principais de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Visitantes Únicos</span>
            <Users size={16} className="text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{m.totalVisitors}</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Acessos à Presell</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Testaram a IA</span>
            <ChefHat size={16} className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{m.simGenerations}</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">{simEngagementRate}% de engajamento</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Cliques Checkout</span>
            <MousePointerClick size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{m.checkoutClicks}</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Indas para a InfinitePay</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Taxa de Conversão</span>
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">{conversionRate}%</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Lead ➔ Intenção de Compra</span>
        </div>
      </div>

      {/* Funil Visual Passo a Passo */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-md">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Eye size={18} className="text-emerald-400" />
          Visualização do Funil (Onde os Leads Passam)
        </h3>

        <div className="space-y-4">
          {[
            {
              step: "1. Acessaram a Presell (Topo da Página)",
              count: m.totalVisitors,
              percent: 100,
              color: "bg-blue-500",
            },
            {
              step: "2. Rolaram até o Simulador e Viram Recursos (Scroll 25%+)",
              count: m.scroll25,
              percent: m.totalVisitors > 0 ? Math.min(100, Math.round((m.scroll25 / m.totalVisitors) * 100)) : 0,
              color: "bg-teal-500",
            },
            {
              step: "3. Usaram a IA (Geraram Receita no Simulador)",
              count: m.simGenerations,
              percent: m.totalVisitors > 0 ? Math.min(100, Math.round((m.simGenerations / m.totalVisitors) * 100)) : 0,
              color: "bg-amber-500",
            },
            {
              step: "4. Chegaram na Oferta de R$ 8,90 e Garantia (Scroll 75%+)",
              count: m.scroll75,
              percent: m.totalVisitors > 0 ? Math.min(100, Math.round((m.scroll75 / m.totalVisitors) * 100)) : 0,
              color: "bg-indigo-500",
            },
            {
              step: "5. Clicaram no Botão de Compra da InfinitePay",
              count: m.checkoutClicks,
              percent: m.totalVisitors > 0 ? Math.min(100, Math.round((m.checkoutClicks / m.totalVisitors) * 100)) : 0,
              color: "bg-emerald-500",
            },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">{item.step}</span>
                <span className="font-mono text-neutral-400">
                  <strong className="text-white">{item.count}</strong> ({item.percent}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${Math.max(item.percent, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Botões Campeões de Venda & Top Ingredientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cliques por Posição de Botão */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <MousePointerClick size={16} className="text-emerald-400" />
            Qual Botão da Página Converte Mais?
          </h3>
          {Object.keys(m.checkoutClicksByCta).length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              Nenhum clique registrado ainda. Os cliques nos botões aparecerão discriminados aqui.
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(m.checkoutClicksByCta).map(([cta, count], i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-xs">
                  <span className="font-semibold text-neutral-200 capitalize">{cta.replace(/_/g, " ")}</span>
                  <span className="font-mono font-bold text-emerald-400">{count} cliques</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Ingredientes Pesquisados */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <ChefHat size={16} className="text-amber-400" />
            O que os Leads mais pesquisam na Geladeira?
          </h3>
          {m.topIngredients.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              Nenhuma receita gerada ainda. Os itens mais combinados aparecerão aqui.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {m.topIngredients.map((ing, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300"
                >
                  <span>{ing.name}</span>
                  <span className="bg-amber-500/20 px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold">
                    {ing.count}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Diagnóstico de Onde os Leads Desistiram (Drop-off) */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5 backdrop-blur-md">
        <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
          <AlertCircle size={16} />
          Diagnóstico de Desistência (Onde os Leads Pararam)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-300 mt-3">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-neutral-400 block mb-1">Saíram no Topo (Bounce)</span>
            <strong className="text-base text-white font-mono">{m.dropoffStage.heroBounce}</strong> leads
            <p className="text-[10px] text-neutral-500 mt-1">Não rolaram a página além do início.</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-neutral-400 block mb-1">Pararam após a Receita</span>
            <strong className="text-base text-amber-400 font-mono">{m.dropoffStage.afterSim}</strong> leads
            <p className="text-[10px] text-neutral-500 mt-1">Geraram ideia com a IA mas não clicaram no botão.</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-neutral-400 block mb-1">Virão a Oferta sem Clicar</span>
            <strong className="text-base text-purple-400 font-mono">{m.dropoffStage.beforeCheckout}</strong> leads
            <p className="text-[10px] text-neutral-500 mt-1">Chegaram no box de R$ 8,90 mas hesitaram.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
