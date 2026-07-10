import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, X, ArrowRight, Sparkles } from "lucide-react";
import { transcribeAudio, synthesizeSpeech } from "@/lib/voice.functions";
import { voiceRoute } from "@/lib/voice-route.functions";
import { handleAiError, useAiOutage } from "@/lib/ai-errors";
import { toast } from "sonner";

type Result = { reply: string; appSlug: string | null; appName: string | null; route: string | null; action: string | null };

/** Botão flutuante global — fale e a NXA responde + sugere qual app abrir. */
export function VoiceAssistant() {
  const nav = useNavigate();
  const stt = useServerFn(transcribeAudio);
  const tts = useServerFn(synthesizeSpeech);
  const routeIt = useServerFn(voiceRoute);
  const outage = useAiOutage();

  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "recording" | "processing">("idle");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function start() {
    setResult(null); setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
                 : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size < 1200) { setState("idle"); return; }
        setState("processing");
        try {
          const buf = await blob.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let bin = ""; const CHUNK = 0x8000;
          for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
          const b64 = btoa(bin);
          const { text } = await stt({ data: { audioBase64: b64, mimeType: blob.type } });
          if (!text.trim()) { toast.error("Não entendi, tenta de novo"); setState("idle"); return; }
          setTranscript(text);
          const r = await routeIt({ data: { transcript: text } });
          setResult(r);
          // Fala a resposta em background (sem bloquear UI)
          if (r.reply) {
            tts({ data: { text: r.reply } })
              .then(({ audioBase64, mimeType }) => {
                const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
                audio.play().catch(() => {});
              })
              .catch(() => {});
          }
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

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Falar com a NXA"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition hover:scale-105 active:scale-95"
        style={{ background: "var(--text-1)", color: "var(--bg-1)" }}
      >
        <Mic size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="w-full max-w-md rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl"
              style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-medium" style={{ color: "var(--n-500)" }}>
                  <Sparkles size={13} /> NXA Voice
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-[var(--n-100)]" aria-label="Fechar">
                  <X size={16} />
                </button>
              </div>

              {/* Mic circle */}
              <div className="flex flex-col items-center py-4">
                <motion.button
                  type="button"
                  onClick={state === "recording" ? stop : start}
                  disabled={state === "processing" || (outage && state !== "recording")}
                  title={outage ? "IA sem crédito no momento" : undefined}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: state === "recording" ? "#ef4444" : "var(--text-1)",
                    color: state === "recording" ? "#fff" : "var(--bg-1)",
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  {state === "recording" && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ background: "#ef4444", opacity: 0.35 }}
                      animate={{ scale: [1, 1.35, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
                  {state === "processing" ? <Loader2 size={28} className="animate-spin" />
                    : state === "recording" ? <Square size={26} />
                    : <Mic size={28} />}
                </motion.button>
                <p className="mt-4 text-sm" style={{ color: "var(--n-500)" }}>
                  {outage ? "IA sem crédito no momento — avise o admin."
                    : state === "recording" ? "Ouvindo... toque para parar"
                    : state === "processing" ? "Processando..."
                    : "Toque e diga o que precisa"}
                </p>
              </div>

              {transcript && (
                <div className="mt-4 rounded-2xl px-4 py-3 text-sm" style={{ background: "var(--n-100)", color: "var(--n-600)" }}>
                  "{transcript}"
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-1)" }}>{result.reply}</p>
                  {result.route && result.appName && (
                    <button
                      type="button"
                      onClick={() => { setOpen(false); nav({ to: result.route! }); }}
                      className="press inline-flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition hover:bg-[var(--n-100)]"
                      style={{ borderColor: "var(--line-1)" }}
                    >
                      <span>Abrir {result.appName}{result.action ? ` — ${result.action}` : ""}</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
