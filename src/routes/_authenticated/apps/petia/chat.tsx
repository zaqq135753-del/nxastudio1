import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { usePets } from "@/hooks/use-pets";
import { vetChat, listChat, clearChat, type VetChatReply } from "@/lib/pet.functions";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/petia/chat")({
  component: VetChatPage,
});

type Msg = { id?: string; role: "user" | "assistant" | "system"; content: string; urgency?: string | null; created_at?: string };

const quickPrompts = [
  { label: "Vômito", text: "Meu pet vomitou hoje, o que devo fazer?" },
  { label: "Alimentação", text: "Posso dar esse alimento para meu pet?" },
  { label: "Comportamento", text: "Por que meu pet está fazendo isso?" },
  { label: "Vacinas", text: "Quais vacinas meu pet precisa tomar?" },
];

function urgencyStyle(u?: string | null) {
  if (u === "red")   return { bg: "#fee2e2", border: "#fecaca", text: "#991b1b", label: "🔴 Emergência" };
  if (u === "yellow")return { bg: "#fef3c7", border: "#fde68a", text: "#92400e", label: "🟡 Vet em 24h" };
  if (u === "green") return { bg: "#dcfce7", border: "#bbf7d0", text: "#166534", label: "🟢 Observar em casa" };
  return null;
}

function VetChatPage() {
  const { active } = usePets();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const send = useServerFn(vetChat);
  const load = useServerFn(listChat);
  const clear = useServerFn(clearChat);

  useEffect(() => {
    if (!active) return;
    load({ data: { petId: active.id } }).then((rows) => setMessages(rows as Msg[]));
  }, [active, load]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function submit(text: string) {
    if (!active) return toast.error("Cadastre um pet primeiro");
    const content = text.trim();
    if (!content) return;
    setInput("");
    setSuggestions([]);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content }]);
    setLoading(true);
    try {
      const reply = (await send({ data: { petId: active.id, message: content, history } })) as VetChatReply;
      setMessages((m) => [...m, { role: "assistant", content: reply.reply, urgency: reply.urgency }]);
      setSuggestions(reply.suggestions ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally { setLoading(false); }
  }

  async function reset() {
    if (!active) return;
    await clear({ data: { petId: active.id } });
    setMessages([]);
    setSuggestions([]);
  }

  const petName = active?.name ?? "seu pet";
  const showIntro = messages.length === 0;

  return (
    <AppShell appSlug="petia">
      <ScreenHeader title="💬 Veterinário Virtual" subtitle="Tire dúvidas sobre saúde e comportamento." />

      <div className="mb-3 flex items-center justify-between">
        <span className="chip chip-neutral">{active ? `Conversando sobre ${petName}` : "Selecione um pet"}</span>
        {messages.length > 0 && (
          <button onClick={reset} className="chip chip-neutral"><Trash2 size={12} className="mr-1 inline" />Limpar</button>
        )}
      </div>

      <div ref={listRef} className="surface p-4 space-y-3 max-h-[58vh] overflow-y-auto">
        {showIntro && (
          <div className="text-sm leading-relaxed">
            Olá! Sou seu veterinário virtual. 🐾
            <br /><br />
            Posso te ajudar com:
            <ul className="mt-1 ml-4 list-disc">
              <li>Dúvidas sobre saúde e sintomas</li>
              <li>Alimentação e nutrição</li>
              <li>Comportamento e treino</li>
              <li>Cuidados gerais</li>
            </ul>
            <br />
            ⚠️ Em emergências, procure um veterinário imediatamente.
            <br /><br />
            Como posso ajudar {petName} hoje?
          </div>
        )}

        {messages.map((m, i) => {
          const u = m.role === "assistant" ? urgencyStyle(m.urgency) : null;
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  background: isUser ? "var(--c-orange)" : "var(--n-100)",
                  color: isUser ? "#fff" : "var(--n-900)",
                }}>
                {u && (
                  <div className="mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: u.bg, color: u.text, border: `1px solid ${u.border}` }}>
                    {u.label}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          );
        })}
        {loading && <TypingIndicator label="Veterinário pensando…" />}
      </div>

      {(showIntro ? quickPrompts.map((q) => q.text) : suggestions).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(showIntro ? quickPrompts : suggestions.map((s) => ({ label: s, text: s }))).map((p, i) => (
            <button key={i} onClick={() => submit("text" in p ? p.text : (p as unknown as string))}
              className="chip chip-neutral">{"label" in p ? p.label : (p as unknown as string)}</button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="mt-3 flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Descreva o sintoma ou dúvida…"
          className="input-field flex-1" />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
          <Send size={14} />
        </button>
      </form>

      <p className="mt-4 text-xs" style={{ color: "var(--n-500)" }}>
        ⚠️ As respostas da IA são orientativas. Sempre consulte um veterinário para diagnóstico e tratamento.
      </p>
    </AppShell>
  );
}
