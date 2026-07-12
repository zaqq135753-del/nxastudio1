/**
 * Onda I — Insight do dia
 * Card com dica curta gerada pela IA, cache diário por período (manhã/tarde/noite).
 */
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateDailyInsight, type DailyInsight as Insight } from "@/lib/ai.functions";
import { readActivity } from "@/lib/reward";
import { Sparkles, RefreshCw } from "lucide-react";

function currentPeriod() {
  const h = new Date().getHours();
  if (h < 6) return "madrugada";
  if (h < 12) return "manhã";
  if (h < 18) return "tarde";
  return "noite";
}
function cacheKey() {
  const d = new Date();
  return `nxa:insight:${d.getFullYear()}-${d.getMonth()}-${d.getDate()}:${currentPeriod()}`;
}

export function DailyInsight() {
  const gen = useServerFn(generateDailyInsight);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(force = false) {
    const key = cacheKey();
    if (!force) {
      const cached = localStorage.getItem(key);
      if (cached) { try { setInsight(JSON.parse(cached)); return; } catch { /* noop */ } }
    }
    setLoading(true);
    try {
      const recent = readActivity().slice(0, 5).map((a) => a.reason);
      const res = await gen({ data: { period: currentPeriod(), recent } });
      setInsight(res);
      localStorage.setItem(key, JSON.stringify(res));
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(false); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="nxa-insight surface relative overflow-hidden p-5">
      <div className="nxa-insight__glow" aria-hidden />
      <div className="relative flex items-start gap-3">
        <div className="nxa-insight__icon"><Sparkles size={16} /></div>
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>
            Insight do dia · {currentPeriod()}
          </div>
          {insight ? (
            <>
              <div className="mt-1 text-base font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {insight.emoji} {insight.headline}
              </div>
              <div className="mt-1 text-sm" style={{ color: "var(--n-700)" }}>{insight.body}</div>
            </>
          ) : (
            <div className="mt-2 text-sm" style={{ color: "var(--n-500)" }}>
              {loading ? "Preparando um insight pra você…" : "Toque em atualizar pra receber um insight."}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Atualizar insight"
          onClick={() => void load(true)}
          disabled={loading}
          className="rounded-full p-2 hover:bg-white/5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
