import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useConversation } from "@elevenlabs/react";
import { Phone, PhoneOff, Loader2, Radio } from "lucide-react";
import { toast } from "sonner";
import { getElevenlabsCallToken } from "@/lib/elevenlabs.functions";

type Props = {
  slug: string;
  label?: string;
  className?: string;
};

type MockState = "idle" | "connecting" | "listening" | "speaking";

/**
 * Botão "Ligar com a IA".
 * - Se houver agent ElevenLabs configurado (ELEVENLABS_AGENT_<SLUG>), abre call WebRTC real.
 * - Caso contrário, entra em MOCK MODE: simula a UI de call (conectando → ouvindo ↔ falando)
 *   pra você testar o fluxo visual antes de configurar os agents.
 */
export function RealtimeCallButton({ slug, label = "Ligar com a IA", className }: Props) {
  const getToken = useServerFn(getElevenlabsCallToken);
  const [starting, setStarting] = useState(false);
  const [mock, setMock] = useState<MockState>("idle");
  const mockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conv = useConversation({
    onConnect: () => toast.success("Conectado — pode falar"),
    onDisconnect: () => toast.message("Chamada encerrada"),
    onError: (e) => toast.error(typeof e === "string" ? e : "Erro na chamada"),
  });

  const status = conv.status;
  const realConnected = status === "connected";
  const mockConnected = mock !== "idle" && mock !== "connecting";
  const connected = realConnected || mockConnected;

  const stopMock = useCallback(() => {
    if (mockTimer.current) { clearTimeout(mockTimer.current); mockTimer.current = null; }
    setMock("idle");
  }, []);

  const cycleMock = useCallback(() => {
    // alterna entre "ouvindo" e "falando" a cada 2.5s para simular a call
    setMock((s) => (s === "speaking" ? "listening" : "speaking"));
    mockTimer.current = setTimeout(cycleMock, 2500);
  }, []);

  const startMock = useCallback(() => {
    setMock("connecting");
    toast.message("Modo demo — voz em tempo real ainda não configurada");
    mockTimer.current = setTimeout(() => {
      setMock("listening");
      toast.success("Conectado (demo)");
      mockTimer.current = setTimeout(cycleMock, 2500);
    }, 900);
  }, [cycleMock]);

  const start = useCallback(async () => {
    setStarting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      let token: string | null = null;
      try {
        const r = await getToken({ data: { slug } });
        token = r.token;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("[ELEVENLABS_NO_AGENT]") || msg.includes("[ELEVENLABS_MISSING_KEY]")) {
          startMock();
          return;
        }
        throw err;
      }
      await conv.startSession({ conversationToken: token!, connectionType: "webrtc" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao iniciar";
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("notallowed")) {
        toast.error("Permita o acesso ao microfone");
      } else {
        toast.error(msg);
      }
    } finally {
      setStarting(false);
    }
  }, [conv, getToken, slug, startMock]);

  const stop = useCallback(async () => {
    if (mockConnected || mock === "connecting") { stopMock(); toast.message("Chamada encerrada (demo)"); return; }
    try { await conv.endSession(); } catch {}
  }, [conv, mock, mockConnected, stopMock]);

  useEffect(() => () => {
    if (mockTimer.current) clearTimeout(mockTimer.current);
    try { void conv.endSession(); } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isConnecting = starting || status === "connecting" || mock === "connecting";
  const speaking = realConnected ? conv.isSpeaking : mock === "speaking";

  return (
    <button
      type="button"
      onClick={connected ? stop : start}
      disabled={isConnecting}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${className ?? ""}`}
      style={{
        background: connected ? "#ef4444" : "var(--text-1)",
        color: connected ? "#fff" : "var(--bg-1)",
      }}
    >
      {isConnecting ? (
        <><Loader2 size={15} className="animate-spin" /> Conectando…</>
      ) : connected ? (
        <>
          <PhoneOff size={15} />
          {speaking ? "IA falando…" : "Ouvindo…"}
          <Radio size={12} className="animate-pulse" />
          {mockConnected && <span className="ml-1 text-[10px] opacity-75">demo</span>}
        </>
      ) : (
        <><Phone size={15} /> {label}</>
      )}
    </button>
  );
}
