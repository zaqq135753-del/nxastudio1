import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, X, Flame, Moon, Coffee, Sparkles } from "lucide-react";
import type { Entitlement } from "@/lib/entitlements.functions";

type Nudge = {
  id: string;
  icon: typeof Bell;
  title: string;
  body: string;
  to?: string;
  tone: "warm" | "cool" | "night" | "spark";
};

const DISMISS_KEY = "nxa:nudges:dismissed";
const DISMISS_TTL = 6 * 60 * 60 * 1000; // 6h

function getDismissed(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || "{}"); } catch { return {}; }
}
function dismiss(id: string) {
  const d = getDismissed();
  d[id] = Date.now();
  localStorage.setItem(DISMISS_KEY, JSON.stringify(d));
}
function isDismissed(id: string) {
  const d = getDismissed();
  const t = d[id];
  return typeof t === "number" && Date.now() - t < DISMISS_TTL;
}

function computeStreakDays(): number {
  try {
    const raw = localStorage.getItem("nxa:activity");
    if (!raw) return 0;
    const items: { at: number }[] = JSON.parse(raw);
    if (!items?.length) return 0;
    const days = new Set(items.map((i) => new Date(i.at).toDateString()));
    let streak = 0;
    const cur = new Date();
    for (;;) {
      if (days.has(cur.toDateString())) { streak++; cur.setDate(cur.getDate() - 1); }
      else break;
    }
    return streak;
  } catch { return 0; }
}

function lastActivityHoursAgo(): number {
  try {
    const raw = localStorage.getItem("nxa:activity");
    if (!raw) return Infinity;
    const items: { at: number }[] = JSON.parse(raw);
    if (!items?.length) return Infinity;
    const last = Math.max(...items.map((i) => i.at));
    return (Date.now() - last) / 3600000;
  } catch { return Infinity; }
}

function buildNudges(ents: Entitlement[]): Nudge[] {
  const h = new Date().getHours();
  const nudges: Nudge[] = [];
  const streak = computeStreakDays();
  const idle = lastActivityHoursAgo();
  const active = ents.filter((e) => e.status === "active" || e.status === "trial").map((e) => e.app_slug);

  // Streak em risco: sem atividade hoje e streak > 0, após 18h
  if (streak > 0 && idle > 12 && h >= 18 && h < 23) {
    nudges.push({
      id: `streak-risk-${new Date().toDateString()}`,
      icon: Flame,
      title: `Seu streak de ${streak} dia${streak > 1 ? "s" : ""} tá em risco`,
      body: "Um clique em qualquer missão mantém a chama acesa.",
      to: "/hub",
      tone: "warm",
    });
  }

  // Bom dia produtivo: entre 7–10h, sem atividade nas últimas 8h
  if (h >= 7 && h < 10 && idle > 8 && active.includes("fitia")) {
    nudges.push({
      id: `morning-move-${new Date().toDateString()}`,
      icon: Coffee,
      title: "Comece leve",
      body: "Fitia tem um treino de 7 minutos pronto pra hoje.",
      to: "/apps/fitia",
      tone: "spark",
    });
  }

  // Almoço: 11–14h, se tem Saboria
  if (h >= 11 && h < 14 && active.includes("saboria")) {
    nudges.push({
      id: `lunch-${new Date().toDateString()}`,
      icon: Sparkles,
      title: "Almoço em 2 minutos?",
      body: "Saboria monta uma receita com o que tem na sua geladeira.",
      to: "/apps/saboria",
      tone: "warm",
    });
  }

  // Wind-down: 21–23h
  if (h >= 21 && h < 23) {
    nudges.push({
      id: `winddown-${new Date().toDateString()}`,
      icon: Moon,
      title: "Hora de desacelerar",
      body: "Feche o dia com um respiro guiado no Focus Mode.",
      to: "/hub",
      tone: "night",
    });
  }

  return nudges.filter((n) => !isDismissed(n.id)).slice(0, 2);
}

export function SmartNudges({ ents }: { ents: Entitlement[] }) {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setNudges(buildNudges(ents));
    const t = setInterval(() => setTick((x) => x + 1), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [ents, tick]);

  if (nudges.length === 0) return null;

  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-2">
      {nudges.map((n) => {
        const Icon = n.icon;
        const bg =
          n.tone === "warm" ? "linear-gradient(135deg, oklch(0.96 0.04 55), oklch(0.94 0.06 30))" :
          n.tone === "cool" ? "linear-gradient(135deg, oklch(0.96 0.03 220), oklch(0.94 0.05 250))" :
          n.tone === "night" ? "linear-gradient(135deg, oklch(0.92 0.04 280), oklch(0.88 0.06 260))" :
          "linear-gradient(135deg, oklch(0.96 0.05 90), oklch(0.94 0.07 60))";
        const content = (
          <div className="press relative flex items-start gap-3 rounded-2xl border p-3.5 hover-lift"
            style={{ borderColor: "var(--line-1)", background: bg }}>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
              style={{ background: "rgba(255,255,255,0.55)" }}>
              <Icon size={16} style={{ color: "var(--text-1)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold leading-tight" style={{ color: "var(--text-1)" }}>
                {n.title}
              </div>
              <div className="mt-0.5 text-[12px] leading-snug" style={{ color: "var(--text-1)", opacity: 0.75 }}>
                {n.body}
              </div>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(n.id); setNudges((prev) => prev.filter((x) => x.id !== n.id)); }}
              className="shrink-0 rounded-full p-1 opacity-60 hover:opacity-100"
              aria-label="Dispensar"
            >
              <X size={13} />
            </button>
          </div>
        );
        return n.to ? (
          <Link key={n.id} to={n.to}>{content}</Link>
        ) : (
          <div key={n.id}>{content}</div>
        );
      })}
    </div>
  );
}
