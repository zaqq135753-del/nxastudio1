/**
 * Onda H — Vida ao vivo: feed de atividade recente do usuário.
 * Lê eventos locais de reward.ts e renderiza timeline animada.
 */
import { useEffect, useState } from "react";
import { readActivity, type ActivityItem } from "@/lib/reward";
import { Sparkles } from "lucide-react";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function ActivityFeed({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readActivity().slice(0, limit));
    sync();
    const onFocus = () => sync();
    window.addEventListener("nxa:activity", sync);
    window.addEventListener("focus", onFocus);
    const t = window.setInterval(sync, 30_000);
    return () => {
      window.removeEventListener("nxa:activity", sync);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(t);
    };
  }, [limit]);

  if (items.length === 0) {
    return (
      <div className="surface p-5 text-sm" style={{ color: "var(--n-500)" }}>
        Suas conquistas aparecem aqui. Complete uma missão pra começar ✨
      </div>
    );
  }

  return (
    <ul className="surface divide-y divide-white/5 overflow-hidden p-0">
      {items.map((it, i) => (
        <li
          key={`${it.at}-${i}`}
          className="nxa-activity-row flex items-center gap-3 px-4 py-3"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="nxa-activity-dot">
            <Sparkles size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{it.reason}</div>
            <div className="text-xs" style={{ color: "var(--n-500)" }}>
              {it.app ? `${it.app} · ` : ""}{timeAgo(it.at)}
            </div>
          </div>
          <div className="nxa-activity-xp">+{it.amount} XP</div>
        </li>
      ))}
    </ul>
  );
}
