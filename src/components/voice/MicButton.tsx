import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mic, Square, Loader2 } from "lucide-react";
import { transcribeAudio } from "@/lib/voice.functions";
import { handleAiError, useAiOutage } from "@/lib/ai-errors";
import { toast } from "sonner";

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Botão de gravar → transcrever. Toque para iniciar, toque de novo para parar.
 * Usa MediaRecorder (webm em Chrome/Firefox, mp4 no Safari).
 */
export function MicButton({ onTranscript, disabled, className }: Props) {
  const call = useServerFn(transcribeAudio);
  const outage = useAiOutage();
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"idle" | "recording" | "processing">("idle");

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size < 1200) { setState("idle"); toast.error("Gravação muito curta"); return; }
        setState("processing");
        try {
          const buf = await blob.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let bin = ""; const CHUNK = 0x8000;
          for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
          const b64 = btoa(bin);
          const { text } = await call({ data: { audioBase64: b64, mimeType: blob.type } });
          if (text.trim()) onTranscript(text.trim());
          else toast.error("Não entendi, tente de novo");
        } catch (e) {
          handleAiError(e, toast);
        } finally { setState("idle"); }
      };
      rec.start();
      recRef.current = rec;
      setState("recording");
    } catch {
      toast.error("Permita o acesso ao microfone");
    }
  }

  function stop() {
    recRef.current?.state === "recording" && recRef.current.stop();
  }

  const busy = state === "processing";
  const rec = state === "recording";

  return (
    <button
      type="button"
      onClick={rec ? stop : start}
      disabled={disabled || busy || (outage && !rec)}
      aria-label={rec ? "Parar gravação" : outage ? "IA sem crédito" : "Falar"}
      title={outage && !rec ? "IA sem crédito no momento" : undefined}
      className={`rounded-full p-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed ${className ?? ""}`}
      style={{
        background: rec ? "#ef4444" : "var(--bg-3, rgba(0,0,0,0.05))",
        color: rec ? "#fff" : "var(--text-1)",
      }}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : rec ? <Square size={16} /> : <Mic size={16} />}
    </button>
  );
}
