import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Volume2, Loader2, Square } from "lucide-react";
import { synthesizeSpeech } from "@/lib/voice.functions";
import { handleAiError, useAiOutage, classifyAiError } from "@/lib/ai-errors";
import { toast } from "sonner";

type Props = { text: string; voice?: string; className?: string };

/** Botão de tocar TTS de qualidade. Fallback para speechSynthesis se falhar. */
export function SpeakButton({ text, voice, className }: Props) {
  const call = useServerFn(synthesizeSpeech);
  const outage = useAiOutage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");

  function stop() {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setState("idle");
  }

  async function play() {
    if (state !== "idle") { stop(); return; }
    setState("loading");
    try {
      const { audioBase64, mimeType } = await call({ data: { text, voice } });
      const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      audio.onerror = () => setState("idle");
      await audio.play();
      setState("playing");
    } catch (err) {
      // Se for falta de crédito/rate-limit, avisa e desabilita — sem fallback
      const kind = classifyAiError(err);
      if (kind === "no_credits" || kind === "rate_limit") {
        handleAiError(err, toast);
        setState("idle");
        return;
      }
      // fallback simples do navegador
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "pt-BR";
        u.onend = () => setState("idle");
        window.speechSynthesis.speak(u);
        setState("playing");
      } else {
        toast.error("Falha ao gerar áudio");
        setState("idle");
      }
    }
  }

  return (
    <button
      type="button"
      onClick={play}
      disabled={outage}
      title={outage ? "IA sem crédito" : undefined}
      aria-label={state === "playing" ? "Parar" : "Ouvir"}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed ${className ?? ""}`}
    >
      {state === "loading" ? <Loader2 size={12} className="animate-spin" />
        : state === "playing" ? <Square size={12} />
        : <Volume2 size={12} />}
      {state === "playing" ? "parar" : "ouvir"}
    </button>
  );
}
