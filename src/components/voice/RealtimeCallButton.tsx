import { useCallback, useEffect, useState } from "react";
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

/**
 * Botão "Ligar com a IA" — abre uma call em tempo real via ElevenLabs WebRTC.
 * Requer:
 *  - Connector ElevenLabs conectado ao projeto (ELEVENLABS_API_KEY)
 *  - Secret ELEVENLABS_AGENT_<SLUG_UPPER> com o agent id criado no painel
 */
export function RealtimeCallButton({ slug, label = "Ligar com a IA", className }: Props) {
  const getToken = useServerFn(getElevenlabsCallToken);
  const [starting, setStarting] = useState(false);

  const conv = useConversation({
    onConnect: () => toast.success("Conectado — pode falar"),
    onDisconnect: () => toast.message("Chamada encerrada"),
    onError: (e) => toast.error(typeof e === "string" ? e : "Erro na chamada"),
  });

  const status = conv.status;
  const connected = status === "connected";

  const start = useCallback(async () => {
    setStarting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { token } = await getToken({ data: { slug } });
      await conv.startSession({ conversationToken: token, connectionType: "webrtc" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao iniciar";
      if (msg.includes("[ELEVENLABS_NO_AGENT]") || msg.includes("[ELEVENLABS_MISSING_KEY]")) {
        toast.error("Voz em tempo real ainda não configurada para este app.");
      } else if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("notallowed")) {
        toast.error("Permita o acesso ao microfone");
      } else {
        toast.error(msg);
      }
    } finally {
      setStarting(false);
    }
  }, [conv, getToken, slug]);

  const stop = useCallback(async () => {
    try { await conv.endSession(); } catch {}
  }, [conv]);

  useEffect(() => () => { try { void conv.endSession(); } catch {} }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      type="button"
      onClick={connected ? stop : start}
      disabled={starting || status === "connecting"}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${className ?? ""}`}
      style={{
        background: connected ? "#ef4444" : "var(--text-1)",
        color: connected ? "#fff" : "var(--bg-1)",
      }}
    >
      {starting || status === "connecting" ? (
        <><Loader2 size={15} className="animate-spin" /> Conectando…</>
      ) : connected ? (
        <>
          <PhoneOff size={15} />
          {conv.isSpeaking ? "IA falando…" : "Ouvindo…"}
          <Radio size={12} className="animate-pulse" />
        </>
      ) : (
        <><Phone size={15} /> {label}</>
      )}
    </button>
  );
}
