import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { generateQuiz, type QuizQuestion } from "@/lib/estudantil.functions";
import { ListChecks, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/simulado")({
  component: SimuladoPage,
});

const SUBJECTS = ["Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Linguagens"];

function SimuladoPage() {
  const [subject, setSubject] = useState("Matemática");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const runQuiz = useServerFn(generateQuiz);

  async function handleStart() {
    setLoading(true);
    setSubmitted(false);
    setUserAnswers({});
    try {
      const data = await runQuiz({ data: { subject } });
      setQuestions(data);
      toast.success(`Simulado de ${subject} gerado!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar simulado.");
    } finally {
      setLoading(false);
    }
  }

  function selectOption(questionId: number, optIdx: number) {
    if (submitted) return;
    setUserAnswers({ ...userAnswers, [questionId]: optIdx });
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Simulador Express ENEM"
        subtitle="Treine com 3 a 5 questões por matéria com gabarito e explicação comentada na hora."
      />

      <div className="surface mb-6 p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/70">
          Escolha a Matéria
        </label>
        <div className="mb-4 flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => (
            <button
              key={sub}
              onClick={() => setSubject(sub)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                subject === sub
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 border border-white/10 text-white/70 hover:text-white"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Sparkles size={16} className="animate-spin" /> Gerando questões de {subject}…
            </>
          ) : (
            <>
              <ListChecks size={16} /> Iniciar Simulado Express
            </>
          )}
        </button>
      </div>

      {questions && (
        <div className="fade-up space-y-6">
          {questions.map((q) => {
            const isCorrect = userAnswers[q.id] === q.correctIndex;
            return (
              <div key={q.id} className="surface rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 text-xs font-bold uppercase text-indigo-400">Questão {q.id}</div>
                <p className="mb-4 text-sm text-white/90 leading-relaxed font-medium">{q.question}</p>

                <div className="space-y-2">
                  {q.options.map((opt, idx) => {
                    const selected = userAnswers[q.id] === idx;
                    let style = "border-white/10 bg-white/5 text-white/80 hover:bg-white/10";

                    if (submitted) {
                      if (idx === q.correctIndex) style = "border-emerald-500/50 bg-emerald-950/30 text-emerald-300 font-semibold";
                      else if (selected) style = "border-red-500/50 bg-red-950/30 text-red-300";
                    } else if (selected) {
                      style = "border-indigo-500 bg-indigo-600/20 text-white font-semibold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => selectOption(q.id, idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {submitted && idx === q.correctIndex && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                        {submitted && selected && idx !== q.correctIndex && <XCircle size={16} className="text-red-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-xs text-white/80 leading-relaxed">
                    <span className="font-bold text-indigo-400">Gabarito Comentado: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {!submitted && (
            <button
              onClick={() => setSubmitted(true)}
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500"
            >
              Finalizar Simulado & Ver Gabarito
            </button>
          )}
        </div>
      )}
    </AppShell>
  );
}
