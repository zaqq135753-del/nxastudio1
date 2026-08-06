import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { generateQuiz, type QuizQuestion } from "@/lib/estudantil.functions";
import { ListChecks, Sparkles, CheckCircle2, XCircle, Timer, Award } from "lucide-react";
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
  const [timeLeft, setTimeLeft] = useState(180 * 3); // 3 minutes per question (9 minutes)

  useEffect(() => {
    if (!questions || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [questions, submitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const runQuiz = useServerFn(generateQuiz);

  async function handleStart() {
    setLoading(true);
    setSubmitted(false);
    setUserAnswers({});
    setTimeLeft(180 * 3);
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

  const scoreCount = questions ? questions.filter(q => userAnswers[q.id] === q.correctIndex).length : 0;

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Simulador com Cronômetro do ENEM"
        subtitle="Treine com 3 minutos por questão (ritmo oficial da banca) e receba o gabarito comentado da IA."
      />

      <div className="surface mb-6 p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Escolha a Matéria
        </label>
        <div className="mb-4 flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => (
            <button
              key={sub}
              onClick={() => setSubject(sub)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                subject === sub
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Sparkles size={16} className="animate-spin text-amber-400" /> Elaborando Caderno de Prova de {subject}…
            </>
          ) : (
            <>
              <ListChecks size={16} /> Iniciar Simulado (3 min/questão)
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="surface mb-6 p-8 text-center fade-up space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Sparkles size={28} className="animate-spin text-amber-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Gerando Questões Inéditas de {subject}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Nossa IA está selecionando questões no formato oficial da Banca do ENEM com gabarito comentado...
            </p>
          </div>
          {/* Skeleton Pulse Rows */}
          <div className="space-y-2 pt-2 max-w-md mx-auto">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse w-3/4 mx-auto" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse w-1/2 mx-auto" />
          </div>
        </div>
      )}

      {questions && (
        <div className="fade-up space-y-6">
          {/* Header Bar with Timer & Score */}
          <div className="surface flex items-center justify-between p-4">
            <div className="flex items-center gap-2 font-mono font-bold text-amber-600 dark:text-amber-400">
              <Timer size={18} /> Tempo de Prova: {formatTime(timeLeft)}
            </div>
            {submitted && (
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <Award size={18} /> Resultado: {scoreCount} / {questions.length} acertos
              </div>
            )}
          </div>

          {questions.map((q) => {
            const isCorrect = userAnswers[q.id] === q.correctIndex;
            return (
              <div key={q.id} className="surface p-5">
                <div className="mb-3 text-xs font-bold uppercase text-neutral-500">Questão {q.id}</div>
                <p className="mb-4 text-sm leading-relaxed font-medium">{q.question}</p>

                <div className="space-y-2">
                  {q.options.map((opt, idx) => {
                    const selected = userAnswers[q.id] === idx;
                    let style = "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100";

                    if (submitted) {
                      if (idx === q.correctIndex) style = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                      else if (selected) style = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
                    } else if (selected) {
                      style = "border-neutral-900 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => selectOption(q.id, idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {submitted && idx === q.correctIndex && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                        {submitted && selected && idx !== q.correctIndex && <XCircle size={16} className="text-red-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className="mt-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-4 text-xs leading-relaxed">
                    <span className="font-bold text-neutral-900 dark:text-white">Gabarito Comentado: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {!submitted && (
            <button
              onClick={() => setSubmitted(true)}
              className="btn-primary w-full py-3"
            >
              Finalizar Simulado & Ver Gabarito
            </button>
          )}
        </div>
      )}
    </AppShell>
  );
}
