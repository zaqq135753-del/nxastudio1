/**
 * Onda M — Morning Brief
 * Aparece entre 5h–11h no Hub. Gera saudação + intenção + 3 missões do dia,
 * personalizadas pelos apps do usuário e streak. Cache diário em localStorage.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { generateMorningBrief, type MorningBrief } from "@/lib/ai.functions";
import { readActivity } from "@/lib/reward";
import { Sunrise, Sparkles } from "lucide-react";

const KEY = "nxa:morning:v1";
const MORNING_START = 5;
const MORNING_END = 11;

function isMorning() {
  const h = new Date().getHours();
  return h >= MORNING_START && h < MORNING_END;
}
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

type Cache = { day: string; brief: MorningBrief };

export function MorningBriefCard({
  name,
  apps,
  streak = 0,
}: {
  name?: string;
  apps: string[];
  streak?: number;
}) {
  const navigate = useNavigate();
  const gen = useServerFn(generateMorningBrief);
  const [brief, setBrief] = useState<MorningBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const morning = isMorning();

  const recent = useMemo(() => {
    const start = new Date(Date.now() - 24 * 3600 * 1000).getTime();
    return readActivity()
      .filter((i) => i.at >= start)
      .map((i) => i.reason);
  }, []);

  useEffect(() => {
    if (!morning) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const c = JSON.parse(raw) as Cache;
        if (c.day === todayKey()) setBrief(c.brief);
      }
    } catch { /* noop */ }
  }, [morning]);

  if (!morning) return null;

  async function generate() {
    setLoading(true);
    try {
      const b = await gen({ data: { name, apps, streak, recent } });
      setBrief(b);
      localStorage.setItem(KEY, JSON.stringify({ day: todayKey(), brief: b } satisfies Cache));
    } catch { /* silencia */ }
    finally { setLoading(false); }
  }

  return (
    <div
      className="surface relative overflow-hidden p-6"
      style={{
        background: "linear-gradient(135deg, rgba(255,220,150,0.14), rgba(255,180,140,0.10) 60%, rgba(200,230,255,0.10))",
        border: "1px solid rgba(220,170,110,0.20)",
      }}
    >
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,210,130,0.35), transparent 70%)" }} />

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest" style={{ color: "var(--n-500)" }}>
        <Sunrise size={12} /> Bom dia · seu briefing
      </div>

      {!brief && (
        <div className="mt-3">
          <div className="text-xl font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Preparado pra hoje, {name || "amigo"}?
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--n-600)" }}>
            {streak > 0
              ? `Você está a ${streak} dia${streak === 1 ? "" : "s"} de streak. Vamos manter?`
              : "Deixa a NXA desenhar 3 missões leves pro seu dia."}
          </p>
          <button onClick={generate} disabled={loading} className="btn-primary mt-4">
            {loading ? "Escrevendo…" : "Gerar meu brief"}
          </button>
        </div>
      )}

      {brief && (
        <div className="mt-3">
          <div className="text-2xl font-semibold leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {brief.greeting}
          </div>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--n-700)" }}>
            <Sparkles size={12} className="mr-1 inline" />
            {brief.intention}
          </p>

          <ul className="mt-4 space-y-2">
            {brief.missions.slice(0, 3).map((m, i) => {
              const inner = (
                <div className="press flex items-center gap-3 rounded-2xl border p-3 transition hover:bg-[var(--n-100)]"
                  style={{ borderColor: "var(--line-1)" }}>
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-sm" style={{ color: "var(--n-800)" }}>{m.title}</span>
                </div>
              );
              return (
                <li key={i}>
                  {m.app && apps.includes(m.app)
                    ? <Link to="/apps/$slug" params={{ slug: m.app }}>{inner}</Link>
                    : inner}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
