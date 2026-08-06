import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { travelChat } from "@/lib/travel.functions";
import type { ChatMessage } from "@/lib/ai-shared";
import { Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/roteiroia/chat")({
  component: ChatPage,
});

const SUGGESTIONS = [
  "Roteiro barato de 4 dias em Buenos Aires",
  "Melhor época pra ir pra Chapada Diamantina",
  "O que fazer em Lisboa com crianças?",
  "Destinos de neve na América do Sul",
];

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const send = useServerFn(travelChat);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function submit(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await send({ data: { history: messages, message: msg } });
      setMessages([...next, { role: "assistant", content: r.reply }]);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }), 50);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="roteiroia">
      <ScreenHeader title="Consultor de viagem" subtitle="Pergunte sobre destinos, épocas, valores." />

      <div ref={scrollRef} className="surface mb-3 max-h-[60vh] overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <div className="text-sm mb-2" style={{ color: "var(--n-500)" }}>Sugestões:</div>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => submit(s)} className="block w-full rounded-xl p-3 text-left text-sm"
                style={{ background: "var(--n-100)" }}>{s}</button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <div className="inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm"
                  style={{
                    background: m.role === "user" ? "var(--c-orange)" : "var(--n-100)",
                    color: m.role === "user" ? "#fff" : "var(--n-700)",
                  }}>
                  <div className="whitespace-pre-wrap">{typeof m.content === "string" ? m.content : m.content.map((part) => (part.type === "text" ? part.text : "")).join("")}</div>
                </div>
              </div>
            ))}
            {loading && <div className="text-xs" style={{ color: "var(--n-500)" }}>Pensando…</div>}
          </div>
        )}
      </div>

      <div className="surface flex gap-2 p-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Digite sua pergunta…" className="input-field flex-1" />
        <button onClick={() => submit()} disabled={loading} className="btn-primary">
          <Send size={14} />
        </button>
      </div>
    </AppShell>
  );
}
