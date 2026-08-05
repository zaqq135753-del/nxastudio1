import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { askTutor } from "@/lib/estudantil.functions";
import { MessageCircle, Send, Sparkles, User, Bot } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/tutor")({
  component: TutorPage,
});

type Message = {
  role: "user" | "assistant";
  content: string;
};

function TutorPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou seu Tutor de Inteligência Artificial do ENEM 🎓.\n\nComo posso te ajudar hoje? Cole o enunciado de uma questão de Exatas, Biológicas ou Humanas que você errou, ou tire qualquer dúvida de conteúdo!",
    },
  ]);

  const runTutor = useServerFn(askTutor);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setLoading(true);

    try {
      const res = await runTutor({ data: { question: userQuery } });
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao responder.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Tutor IA 24h & Explicador de Questões"
        subtitle="Tire dúvidas de matérias e entenda o passo a passo de resolução de qualquer questão do ENEM."
      />

      <div className="surface mb-4 flex flex-col h-[500px] rounded-2xl border border-white/10 p-4">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                  m.role === "user" ? "bg-indigo-600 text-white" : "bg-white/10 text-indigo-400"
                }`}
              >
                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Sparkles size={14} className="animate-spin text-indigo-400" />
              Tutor analisando questão…
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="mt-3 flex gap-2 pt-3 border-t border-white/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Cole sua questão ou faça uma pergunta sobre a matéria..."
            className="input-field flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn-primary flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-500 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
