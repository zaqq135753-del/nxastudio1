import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { dailyBriefing, type Briefing } from "@/lib/agent.functions";
import { Sparkles, ArrowUpRight, RefreshCw, Loader2 } from "lucide-react";

export function BriefingCard() {
  const call = useServerFn(dailyBriefing);
  const [data, setData] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try { setData(await call()); }
    catch (e) { setErr(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const cached = typeof window !== "undefined" ? sessionStorage.getItem("briefing:v1") : null;
    if (cached) { try { setData(JSON.parse(cached)); setLoading(false); return; } catch { /* ignore */ } }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (data && typeof window !== "undefined") sessionStorage.setItem("briefing:v1", JSON.stringify(data));
  }, [data]);

  return (
    <div className="glass-card fade-up relative overflow-hidden p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="ai-badge mb-2"><Sparkles size={12} /> Concierge IA · para agora</div>
          <div className="text-lg font-semibold tracking-tight">
            {loading ? "Analisando seu contexto…" : data?.headline ?? "Sem sugestões ainda"}
          </div>
          {data?.greeting && !loading && (
            <div className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{data.greeting}</div>
          )}
        </div>
        <button onClick={load} disabled={loading}
          className="press inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs"
          style={{ background: "var(--n-100)", color: "var(--muted-foreground)" }}>
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} atualizar
        </button>
      </div>

      {err && <div className="text-xs" style={{ color: "#ef4444" }}>{err}</div>}

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {[0,1,2].map((i) => <div key={i} className="h-24 rounded-2xl animate-shimmer-bg" />)}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {(data?.items ?? []).map((it, i) => (
            <Link key={i} to={it.route}
              className="press group relative block rounded-2xl border p-3 hover:bg-[var(--n-50,rgba(0,0,0,0.02))]"
              style={{ borderColor: "var(--line-1)" }}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{it.app}</span>
                <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100" />
              </div>
              <div className="text-sm font-semibold leading-snug">{it.title}</div>
              <div className="mt-1 text-[12px] line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{it.reason}</div>
              <div className="mt-2 text-[11px] font-medium" style={{ color: "var(--brand, currentColor)" }}>→ {it.action}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
