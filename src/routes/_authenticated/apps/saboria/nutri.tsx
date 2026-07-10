import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { nutriChat } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/saboria/nutri")({
  component: NutriPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Olá! 👋 Sou seu **nutricionista virtual**. Posso ajudar com:\n\n" +
    "• 📊 Análise nutricional de refeições\n" +
    "• 💪 Contagem de macros (kcal, proteína, carbo, gordura)\n" +
    "• 🎯 Sugestões para suas metas\n" +
    "• 🔄 Substituições mais saudáveis\n" +
    "• ❓ Dúvidas sobre alimentação\n\n" +
    "Como posso te ajudar hoje?",
};

const SUGGESTIONS = [
  { label: "🍽️ Calorias de um prato", text: "Quantas calorias tem um prato de arroz, feijão, frango e salada?" },
  { label: "💪 Mais proteína", text: "Como tornar essa receita mais proteica?" },
  { label: "🥗 Alternativas saudáveis", text: "Substituição saudável para fritura" },
  { label: "🔥 Low carb", text: "Receita low carb para jantar" },
];

function renderContent(text: string) {
  // Render **bold** in brand color, keep newlines
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} style={{ color: "var(--brand-2)" }}>
              {p.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{p}</span>;
      })}
    </>
  );
}

function NutriPage() {
  const call = useServerFn(nutriChat);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasUserSent = messages.some((m) => m.role === "user");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await call({
        data: { messages: next.filter((m) => m !== WELCOME).map((m) => ({ role: m.role, content: m.content })) },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: r.content }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na resposta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <ScreenHeader
        title="🏥 Nutricionista IA"
        subtitle="Pergunte sobre nutrição, macros e ajustes nas suas receitas"
      />

      <div
        ref={scrollRef}
        className="mb-3 h-[52vh] overflow-y-auto rounded-2xl border p-4"
        style={{ background: "var(--bg-2)", borderColor: "var(--line-1)" }}
      >
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-4 py-2.5 text-sm"
                style={
                  m.role === "user"
                    ? {
                        background: "var(--brand)",
                        color: "#fff",
                        borderRadius: "16px 16px 4px 16px",
                      }
                    : {
                        background: "var(--bg-3)",
                        color: "var(--text-1)",
                        border: "1px solid var(--line-1)",
                        borderRadius: "16px 16px 16px 4px",
                      }
                }
              >
                {renderContent(m.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="flex gap-1.5 px-4 py-3"
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid var(--line-1)",
                  borderRadius: "16px 16px 16px 4px",
                }}
              >
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasUserSent && !loading && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s.label} className="chip chip-neutral" onClick={() => send(s.text)}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="input-field"
          placeholder="Pergunte ao nutricionista IA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
        />
        <button
          className="btn-primary shrink-0"
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          aria-label="Enviar mensagem"
        >
          <Send size={16} />
        </button>
      </div>
    </AppShell>
  );
}
