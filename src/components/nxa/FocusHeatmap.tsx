/**
 * Onda K — Mini heatmap semanal de sessões de foco (Pomodoro + Respiração).
 * Lê a activity local e conta ocorrências por dia dos últimos 7.
 */
import { useEffect, useMemo, useState } from "react";
import { readActivity } from "@/lib/reward";

const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function FocusHeatmap() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onAct = () => setTick((t) => t + 1);
    window.addEventListener("nxa:activity", onAct);
    return () => window.removeEventListener("nxa:activity", onAct);
  }, []);

  const cells = useMemo(() => {
    const items = readActivity().filter(
      (i) => i.app === "wellness" && (i.reason.includes("Pomodoro") || i.reason.includes("respiração"))
    );
    const now = new Date();
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - idx));
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 86400000;
      const count = items.filter((i) => i.at >= start && i.at < end).length;
      return { day: d.getDay(), count };
    });
  }, [tick]);

  const total = cells.reduce((a, c) => a + c.count, 0);
  const max = Math.max(1, ...cells.map((c) => c.count));

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest" style={{ color: "var(--n-500)" }}>
            Ritmo de foco
          </div>
          <div className="text-lg font-semibold">
            {total} sessõe{total === 1 ? "" : "s"} · últimos 7 dias
          </div>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("nxa:focus:open"))}
          className="btn-ghost text-xs"
        >
          Abrir foco →
        </button>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        {cells.map((c, i) => {
          const h = 8 + Math.round((c.count / max) * 44);
          const active = c.count > 0;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="w-full rounded-md transition-all"
                style={{
                  height: h,
                  background: active
                    ? "linear-gradient(180deg,#e79a5c,#d97757)"
                    : "var(--cream-100)",
                  boxShadow: active ? "0 4px 12px rgba(217,119,87,0.25)" : "none",
                }}
              />
              <span className="text-[10px]" style={{ color: "var(--n-500)" }}>
                {DAYS[c.day]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
