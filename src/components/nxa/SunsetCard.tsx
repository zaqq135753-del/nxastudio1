/**
 * Onda L — Sunset Card
 * Aparece entre 19h–4h no Hub. Gera resumo do dia (via IA) baseado na Activity,
 * oferece narração TTS (persona NXA) e um botão pra iniciar respiração.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateSunsetRecap, type SunsetRecap } from "@/lib/ai.functions";
import { synthesizeSpeech } from "@/lib/voice.functions";
import { readActivity } from "@/lib/reward";
import { Moon, Play, Pause, Wind } from "lucide-react";

const KEY = "nxa:sunset:v1";
const NIGHT_START = 19; // 19h
const NIGHT_END = 4;    // até 4h da manhã seguinte

function isNight() {
  const h = new Date().getHours();
  return h >= NIGHT_START || h < NIGHT_END;
}
function todayKey() {
  const d = new Date();
  if (d.getHours() < NIGHT_END) d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

type Cache = { day: string; recap: SunsetRecap };

export function SunsetCard() {
  const gen = useServerFn(generateSunsetRecap);
  const tts = useServerFn(synthesizeSpeech);
  const [recap, setRecap] = useState<SunsetRecap | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const night = isNight();

  const { xp, actions } = useMemo(() => {
    const day = todayKey();
    const start = new Date(day + "T00:00:00").getTime();
    const items = readActivity().filter((i) => i.at >= start);
    return {
      xp: items.reduce((a, i) => a + i.amount, 0),
      actions: items.map((i) => i.reason),
    };
  }, []);

  useEffect(() => {
    if (!night) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const c = JSON.parse(raw) as Cache;
        if (c.day === todayKey()) setRecap(c.recap);
      }
    } catch { /* noop */ }
  }, [night]);

  if (!night) return null;

  async function generate() {
    setLoading(true);
    try {
      const r = await gen({ data: { actions, xp } });
      setRecap(r);
      localStorage.setItem(KEY, JSON.stringify({ day: todayKey(), recap: r } satisfies Cache));
    } catch { /* silencia — ui mostra fallback */ }
    finally { setLoading(false); }
  }

  async function narrate() {
    if (!recap) return;
    if (playing && audioRef.current) { audioRef.current.pause(); setPlaying(false); return; }
    try {
      const text = `${recap.headline}. ${recap.body}. ${recap.suggestion}`;
      const { audioBase64 } = await tts({ data: { text, voice: "nova" } });
      const a = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
      audioRef.current = a;
      a.onended = () => setPlaying(false);
      await a.play();
      setPlaying(true);
    } catch { /* noop */ }
  }

  return (
    <div
      className="surface relative overflow-hidden p-6"
      style={{
        background: "linear-gradient(135deg, rgba(60,40,80,0.08), rgba(220,140,90,0.10) 60%, rgba(255,220,180,0.12))",
        border: "1px solid rgba(120,90,140,0.15)",
      }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,190,130,0.35), transparent 70%)" }} />

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest" style={{ color: "var(--n-500)" }}>
        <Moon size={12} /> Sunset · encerre o dia
      </div>

      {!recap && (
        <div className="mt-3">
          <div className="text-xl font-semibold" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Como foi o seu dia?
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--n-600)" }}>
            {xp > 0
              ? `Você ganhou ${xp} XP em ${actions.length} conquista${actions.length === 1 ? "" : "s"}. Quer um resumo pra fechar bem?`
              : "Um dia calmo também conta. Deixa a NXA te ninar."}
          </p>
          <button onClick={generate} disabled={loading} className="btn-primary mt-4">
            {loading ? "Escrevendo…" : "Gerar meu sunset"}
          </button>
        </div>
      )}

      {recap && (
        <div className="mt-3">
          <div className="text-2xl font-semibold leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {recap.headline}
          </div>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--n-700)" }}>
            {recap.body}
          </p>
          <p className="mt-2 text-sm italic" style={{ color: "var(--n-500)" }}>
            {recap.suggestion}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={narrate} className="btn-ghost flex items-center gap-2 text-sm">
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? "Pausar" : "Ouvir NXA"}
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("nxa:focus:open"))}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <Wind size={14} /> Respirar antes de dormir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
