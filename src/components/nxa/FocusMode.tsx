/**
 * FocusMode — Onda J: Rituais & Foco.
 * Overlay fullscreen com respiração guiada (4-7-8) + timer Pomodoro (25min).
 * Abre via evento global `nxa:focus:open` (disparado do botão flutuante ou ⌘K).
 * Ao concluir sessão completa: recompensa XP via reward().
 */
import { useEffect, useRef, useState } from "react";
import { reward } from "@/lib/reward";
import { haptic } from "@/lib/feedback";

type Mode = "breath" | "pomodoro";
type BreathPhase = "in" | "hold" | "out";

const BREATH_SEQ: { phase: BreathPhase; secs: number; label: string }[] = [
  { phase: "in", secs: 4, label: "Inspire" },
  { phase: "hold", secs: 7, label: "Segure" },
  { phase: "out", secs: 8, label: "Expire" },
];

export function FocusMode() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("breath");

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("nxa:focus:open", onOpen);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("nxa:focus:open", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Modo foco"
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(1200px 800px at 50% 30%, rgba(255,247,232,0.98), rgba(250,250,249,0.98) 60%, rgba(240,236,228,0.99))",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      }}
    >
      <button
        onClick={() => setOpen(false)}
        aria-label="Fechar foco"
        className="absolute right-5 top-5 rounded-full px-3 py-1.5 text-sm"
        style={{ background: "var(--cream-100)", color: "var(--cream-500)" }}
      >
        Fechar · ESC
      </button>

      <div className="mb-6 flex gap-1 rounded-full p-1" style={{ background: "var(--cream-100)" }}>
        <TabBtn active={mode === "breath"} onClick={() => setMode("breath")}>
          Respiração
        </TabBtn>
        <TabBtn active={mode === "pomodoro"} onClick={() => setMode("pomodoro")}>
          Pomodoro
        </TabBtn>
      </div>

      {mode === "breath" ? <BreathPanel /> : <PomodoroPanel />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-4 py-1.5 text-sm transition"
      style={{
        background: active ? "var(--cream-50)" : "transparent",
        color: active ? "var(--cream-700)" : "var(--cream-500)",
        boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {children}
    </button>
  );
}

/* ---------------- Breath 4-7-8 ---------------- */

function BreathPanel() {
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [step, setStep] = useState(0);
  const [remaining, setRemaining] = useState(BREATH_SEQ[0].secs);
  const rewardedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        // avança
        setStep((s) => {
          const next = (s + 1) % BREATH_SEQ.length;
          if (next === 0) {
            setCycle((c) => {
              const nc = c + 1;
              if (nc >= 4 && !rewardedRef.current) {
                rewardedRef.current = true;
                void reward(20, "Ritual de respiração 4-7-8", "wellness");
                haptic("success");
              }
              return nc;
            });
          }
          return next;
        });
        haptic("light");
        return BREATH_SEQ[(step + 1) % BREATH_SEQ.length].secs;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, step]);

  const current = BREATH_SEQ[step];
  const scale = current.phase === "in" ? 1.25 : current.phase === "hold" ? 1.25 : 0.85;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-56 w-56 items-center justify-center rounded-full transition-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,220,180,0.9), rgba(255,180,120,0.6) 50%, rgba(230,150,90,0.35))",
          transform: `scale(${running ? scale : 1})`,
          transitionDuration: `${current.secs}s`,
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.4, 1)",
          boxShadow: "0 30px 90px rgba(230,150,90,0.35)",
        }}
      >
        <div className="text-center">
          <div className="text-4xl font-semibold" style={{ color: "var(--cream-700)" }}>
            {remaining}
          </div>
          <div className="mt-1 text-sm" style={{ color: "var(--cream-600)" }}>
            {running ? current.label : "Pronto?"}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-xs uppercase tracking-widest" style={{ color: "var(--cream-500)" }}>
          Ciclo {cycle} de 4
        </div>
        <button
          onClick={() => {
            if (!running) {
              setCycle(0);
              setStep(0);
              setRemaining(BREATH_SEQ[0].secs);
              rewardedRef.current = false;
            }
            setRunning((v) => !v);
            haptic("medium");
          }}
          className="btn-primary mt-4"
        >
          {running ? "Pausar" : "Começar"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Pomodoro 25min ---------------- */

function PomodoroPanel() {
  const TOTAL = 25 * 60;
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(TOTAL);
  const rewardedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false);
          if (!rewardedRef.current) {
            rewardedRef.current = true;
            void reward(40, "Pomodoro de foco concluído", "wellness");
            haptic("success");
          }
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const pct = ((TOTAL - left) / TOTAL) * 100;

  return (
    <div className="flex w-full max-w-sm flex-col items-center px-6">
      <div className="text-7xl font-semibold tabular-nums" style={{ color: "var(--cream-700)" }}>
        {mm}:{ss}
      </div>
      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--cream-100)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#e79a5c,#d97757)" }}
        />
      </div>
      <div className="mt-8 flex gap-2">
        <button
          onClick={() => {
            setRunning((v) => !v);
            haptic("medium");
          }}
          className="btn-primary"
        >
          {running ? "Pausar" : left === TOTAL ? "Iniciar 25 min" : "Continuar"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setLeft(TOTAL);
            rewardedRef.current = false;
          }}
          className="btn-ghost"
        >
          Reset
        </button>
      </div>
      <p className="mt-6 text-center text-xs" style={{ color: "var(--cream-500)" }}>
        Silêncio, uma tarefa só. +40 XP ao concluir.
      </p>
    </div>
  );
}

/* ---------------- Floating trigger ---------------- */

export function FocusFAB() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("nxa:focus:open"))}
      aria-label="Abrir modo foco"
      className="fixed bottom-5 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105"
      style={{
        background: "linear-gradient(135deg,#fff,#f4ece0)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
        border: "1px solid var(--cream-200)",
      }}
    >
      <span style={{ fontSize: 20 }}>🌿</span>
    </button>
  );
}
