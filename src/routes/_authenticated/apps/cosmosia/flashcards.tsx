import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { BookOpen, RotateCcw, Check, Flame, Sparkles, Brain, Trophy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/flashcards")({
  component: FlashcardsPage,
});

type Flashcard = {
  id: number;
  topic: string;
  front: string;
  back: string;
  level: "easy" | "medium" | "hard" | "new";
};

const INITIAL_CARDS: Flashcard[] = [
  { id: 1, topic: "Filosofia / Redação", front: "Qual o conceito de 'Banalidade do Mal' de Hannah Arendt?", back: "Muitos indivíduos cometem atos cruéis não por maldade inerente, mas pela incapacidade de pensar criticamente sobre as ordens impostas pelas instituições.", level: "new" },
  { id: 2, topic: "Biologia / Ecologia", front: "Qual a diferença entre Relação Harmônica e Desarmônica?", back: "Harmônica: Ninguém sai prejudicado (+/+ ou +/0). Desarmônica: Pelo menos uma espécie sai prejudicada (+/-).", level: "new" },
  { id: 3, topic: "Matemática", front: "Como calcular a probabilidade de eventos independentes?", back: "Multiplica-se a probabilidade do primeiro evento pela do segundo: P(A e B) = P(A) x P(B).", level: "new" },
  { id: 4, topic: "Química", front: "O que caracteriza uma reação de Neutralização?", back: "Reação entre Ácido + Base produzindo Sal + Água.", level: "new" },
  { id: 5, topic: "Física", front: "Qual a Segunda Lei de Newton (Princípio Fundamental da Dinâmica)?", back: "A força resultante que atua sobre um corpo é igual ao produto de sua massa pela aceleração: F = m x a.", level: "new" },
  { id: 6, topic: "História do Brasil", front: "O que foi a Lei Eusébio de Queirós de 1850?", back: "Lei que proibiu o tráfico intercontinental de escravizados para o Brasil, impulsionando o tráfico interprovincial e a imigração europeia.", level: "new" },
];

export function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>(INITIAL_CARDS);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("nxa_study_flashcards_progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStreak(parsed.streak || 0);
        setReviewedCount(parsed.reviewedCount || 0);
      } catch {}
    }
  }, []);

  const card = cards[index];

  function handleRate(level: "easy" | "medium" | "hard") {
    const newStreak = streak + 1;
    const newCount = reviewedCount + 1;
    setStreak(newStreak);
    setReviewedCount(newCount);

    localStorage.setItem("nxa_study_flashcards_progress", JSON.stringify({ streak: newStreak, reviewedCount: newCount }));

    if (level === "easy") toast.success("Ótimo! Agendado para daqui a 7 dias.");
    else if (level === "medium") toast.info("Revisão marcada para 3 dias.");
    else toast.warning("Revisão agendada para amanhã.");

    setFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, 250);
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Flashcards 3D & Sistema Anki (SRS)"
        subtitle="Memorização científica por Repetição Espaçada com efeito de giro 3D no celular."
      />

      {/* Stats bar */}
      <div className="surface mb-6 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-amber-500 animate-bounce" />
          <div>
            <span className="text-[10px] font-extrabold uppercase text-neutral-400 block">Sequência Diária</span>
            <span className="text-sm font-black">{streak} Cards Seguidos</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Brain size={20} className="text-indigo-500" />
          <div>
            <span className="text-[10px] font-extrabold uppercase text-neutral-400 block">Revisados Hoje</span>
            <span className="text-sm font-black">{reviewedCount} Fichas</span>
          </div>
        </div>
      </div>

      {/* 3D Flip Card Component Container */}
      <div className="mx-auto max-w-md perspective-1000">
        <div
          onClick={() => setFlipped(!flipped)}
          className={`relative h-80 w-full rounded-3xl cursor-pointer transition-transform duration-700 transform-style-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
          }}
        >
          {/* FRENTE DA CARTA */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-3xl p-7 text-center surface border-2 border-indigo-500/20 shadow-2xl backdrop-blur-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                {card.topic}
              </span>
              <span className="text-[11px] font-bold text-neutral-400">{index + 1} de {cards.length}</span>
            </div>

            <div className="my-auto px-2">
              <h4 className="text-lg font-bold leading-snug text-neutral-900 dark:text-neutral-100">
                {card.front}
              </h4>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-400">
              <RotateCcw size={14} className="animate-spin" /> Toque para virar o cartão e ver a resposta
            </div>
          </div>

          {/* VERSO DA CARTA (RESPOSTA) */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-3xl p-7 text-center surface border-2 border-emerald-500/30 bg-neutral-900 text-white shadow-2xl rotate-y-180"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">
                Gabarito / Explicação
              </span>
              <Sparkles size={16} className="text-amber-400" />
            </div>

            <div className="my-auto px-2">
              <p className="text-sm font-medium leading-relaxed text-neutral-200">
                {card.back}
              </p>
            </div>

            <div className="text-[11px] text-neutral-400 font-bold">
              Classifique sua facilidade abaixo para o Algoritmo SRS
            </div>
          </div>
        </div>
      </div>

      {/* Botões do Algoritmo de Repetição Espaçada (SRS) */}
      {flipped && (
        <div className="mx-auto mt-6 max-w-md grid grid-cols-3 gap-2 fade-up">
          <button
            onClick={() => handleRate("hard")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
          >
            <AlertTriangle size={18} className="mb-1" />
            <span className="text-[11px] font-black">Errei</span>
            <span className="text-[9px] opacity-75">Revisar amanhã</span>
          </button>

          <button
            onClick={() => handleRate("medium")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition"
          >
            <Brain size={18} className="mb-1" />
            <span className="text-[11px] font-black">Médio</span>
            <span className="text-[9px] opacity-75">Revisar em 3 dias</span>
          </button>

          <button
            onClick={() => handleRate("easy")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            <Trophy size={18} className="mb-1" />
            <span className="text-[11px] font-black">Fácil</span>
            <span className="text-[9px] opacity-75">Revisar em 7 dias</span>
          </button>
        </div>
      )}
    </AppShell>
  );
}
