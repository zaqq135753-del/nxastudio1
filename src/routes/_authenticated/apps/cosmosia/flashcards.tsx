import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { BookOpen, RotateCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/flashcards")({
  component: FlashcardsPage,
});

const FLASHCARDS = [
  { topic: "Filosofia / Redação", front: "Qual o conceito de 'Banalidade do Mal' de Hannah Arendt?", back: "Muitos indivíduos cometem atos cruéis não por maldade inerente, mas pela incapacidade de pensar criticamente sobre as ordens impostas pelas instituições." },
  { topic: "Biologia", front: "Qual a diferença entre Relação Harmônica e Desarmônica?", back: "Harmônica: Ninguém sai prejudicado (+/+ ou +/0). Desarmônica: Pelo menos uma espécie sai prejudicada (+/-)." },
  { topic: "Matemática", front: "Como calcular a probabilidade de eventos independentes?", back: "Multiplica-se a probabilidade do primeiro evento pela probabilidade do segundo evento: P(A e B) = P(A) x P(B)." },
  { topic: "Química", front: "O que é uma reação de Neutralização?", back: "Ácido + Base -> Sal + Água." },
];

function FlashcardsPage() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = FLASHCARDS[index];

  function next() {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % FLASHCARDS.length);
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Flashcards de Memorização Rápida"
        subtitle="Fichas de revisão interativas para fixar os conceitos mais cobrados direto no celular."
      />

      <div className="surface mx-auto flex h-72 max-w-md flex-col justify-between rounded-3xl border border-white/10 p-6 text-center shadow-xl">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">{card.topic}</div>

        <div className="my-auto flex items-center justify-center p-4">
          <p className="text-base font-semibold text-white leading-relaxed">
            {flipped ? card.back : card.front}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={() => setFlipped(!flipped)}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white"
          >
            <RotateCw size={14} /> Virar Cartão
          </button>

          <button
            onClick={next}
            className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Próximo Cartão →
          </button>
        </div>
      </div>
    </AppShell>
  );
}
