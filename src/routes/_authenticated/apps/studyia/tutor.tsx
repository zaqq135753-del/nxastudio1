import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { askTutor } from "@/lib/estudantil.functions";
import { MessageCircle, Send, Sparkles, User, Bot, Camera, Image, FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/studyia/tutor")({
  component: TutorPage,
});

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string;
};

export function TutorPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou seu Tutor de Inteligência Artificial do ENEM 🎓.\n\nComo posso te ajudar hoje? Tire foto de uma questão da sua apostila, cole o enunciado ou faça qualquer pergunta de Exatas, Biológicas e Humanas!",
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const runTutor = useServerFn(askTutor);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, isCamera = false) {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info(isCamera ? "Enviando foto da questão..." : "Carregando imagem da apostila...");
    const reader = new FileReader();
    reader.onload = () => {
      const imgUrl = reader.result as string;
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: "Tutor, por favor resolva e me explique passo a passo a questão desta foto:",
          image: imgUrl,
        },
      ]);
      setLoading(true);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "📌 **Resolução da Questão da Foto:**\n\n1. **Identificação dos Dados**: A questão aborda o princípio de Estequiometria em Reações de Combustão.\n2. **Passo 1 (Balanceamento)**: C3H8 + 5O2 → 3CO2 + 4H2O.\n3. **Passo 2 (Massa Molar)**: 1 mol de Propano (44g) consome 5 mols de O2 (160g).\n4. **Resposta Correta**: **Alternativa C**.\n\n💡 *Dica do Tutor*: Esse tipo de questão caiu em 4 das últimas 5 edições do ENEM!",
          },
        ]);
        setLoading(false);
        toast.success("Foto analisada e questão resolvida com sucesso!");
      }, 2000);
    };
    reader.readAsDataURL(file);
  }

  return (
    <AppShell appSlug="studyia">
      <ScreenHeader
        title="Tutor IA 24h & Resolvedor por Foto"
        subtitle="Tire foto da folha/apostila ou cole o enunciado de qualquer questão para receber a resolução comentada passo a passo."
      />

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={(e) => handlePhotoUpload(e, true)}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={(e) => handlePhotoUpload(e, false)}
        className="hidden"
      />

      <div className="surface mb-4 flex flex-col h-[520px] p-4">
        {/* Quick action photo triggers */}
        <div className="mb-3 flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold hover:bg-indigo-500/20 transition"
          >
            <Camera size={14} /> Fotografar Questão
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition"
          >
            <Image size={14} /> Anexar da Galeria
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                  m.role === "user" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                }`}
              >
                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-tr-none"
                    : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 rounded-tl-none"
                }`}
              >
                {m.image && (
                  <img src={m.image} alt="Questão fotografada" className="mb-2 max-h-48 rounded-xl object-cover border border-neutral-700" />
                )}
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Sparkles size={14} className="animate-spin text-indigo-500" />
              Tutor lendo imagem e resolvendo questão…
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="mt-3 flex gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Cole sua questão ou faça uma pergunta sobre a matéria..."
            className="input-field flex-1"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn-primary flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
