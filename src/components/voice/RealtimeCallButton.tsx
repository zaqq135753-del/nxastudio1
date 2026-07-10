import { useCallback, useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Loader2, Radio } from "lucide-react";
import { toast } from "sonner";

type Props = {
  slug: string;
  label?: string;
  className?: string;
};

type MockState = "idle" | "connecting" | "listening" | "speaking";

/**
 * Botão "Ligar com a IA" — MOCK MODE.
 * Simula a UI de call (conectando → ouvindo ↔ falando) sem depender de ElevenLabs.
 * Quando você quiser plugar voz real, troque este componente por uma versão
 * envolta em <ElevenLabsProvider> usando useConversation().
 */
export function RealtimeCallButton({ slug: _slug, label = "Ligar com a IA", className }: Props) {
  const [mock, setMock] = useState<MockState>("idle");
  const mockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connected = mock === "listening" || mock === "speaking";
  const isConnecting = mock === "connecting";
  const speaking = mock === "speaking";

  const stopMock = useCallback(() => {
    if (mockTimer.current) { clearTimeout(mockTimer.current); mockTimer.current = null; }
    setMock("idle");
  }, []);

  const cycleMock = useCallback(() => {
    setMock((s) => (s === "speaking" ? "listening" : "speaking"));
    mockTimer.current = setTimeout(cycleMock, 2500);
  }, []);

  const start = useCallback(() => {
    setMock("connecting");
    toast.message("Modo demo — voz em tempo real ainda não configurada");
    mockTimer.current = setTimeout(() => {
      setMock("listening");
      toast.success("Conectado (demo)");
      mockTimer.current = setTimeout(cycleMock, 2500);
    }, 900);
  }, [cycleMock]);

  const stop = useCallback(() => {
    stopMock();
    toast.message("Chamada encerrada (demo)");
  }, [stopMock]);

  useEffect(() => () => {
    if (mockTimer.current) clearTimeout(mockTimer.current);
  }, []);

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
          <span className="ml-1 text-[10px] opacity-75">demo</span>
        </>
      ) : (
        <><Phone size={15} /> {label}</>
      )}
    </button>
  );
}
