import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { financialChat } from "@/lib/grana.functions";
import { Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/granaia/chat")({
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const chat = useServerFn(financialChat);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content: msg }];
    setMsgs(next);
    setLoading(true);
    try {
      const res = await chat({ data: { message: msg, history: msgs } });
      setMsgs([...next, { role: "assistant", content: res.reply }]);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="granaia">
      <ScreenHeader title="Consultor IA" subtitle="Analisa suas transações reais e responde perguntas." />

      <div className="space-y-3 mb-4">
        {msgs.length === 0 && !loading && (
          <div className="surface p-5 text-sm" style={{ color: "var(--n-500)" }}>
            Pergunte algo como: "Como posso economizar 500 reais este mês?" ou "Em que categoria estou gastando mais?"
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`surface p-4 whitespace-pre-wrap ${m.role === "user" ? "ml-8" : "mr-8"}`}>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: "var(--n-500)" }}>
              {m.role === "user" ? "Você" : "Consultor IA"}
            </div>
            <div className="text-[15px]">{m.content}</div>
          </div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-24 left-1/2 z-30 w-full max-w-[820px] -translate-x-1/2 px-4">
        <div className="glass flex items-center gap-2 rounded-full p-2" style={{ boxShadow: "var(--shadow-elev)" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Pergunte ao consultor…" className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
          <button onClick={send} disabled={loading || !input.trim()} className="btn-primary rounded-full !p-2.5"><Send size={16} /></button>
        </div>
      </div>
    </AppShell>
  );
}
