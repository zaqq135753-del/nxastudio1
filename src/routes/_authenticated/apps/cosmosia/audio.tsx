import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { analyzeAudioExplanation, type AudioAnalysis } from "@/lib/estudantil.functions";
import { Mic, Square, Play, Sparkles, CheckCircle2, AlertCircle, Volume2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/audio")({
  component: AudioPage,
});

function AudioPage() {
  const [topic, setTopic] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AudioAnalysis | null>(null);

  const runAnalysis = useServerFn(analyzeAudioExplanation);

  function toggleRecord() {
    if (!isRecording) {
      setIsRecording(true);
      toast.info("Gravação simulada iniciada... Fale sua explicação!");
      setTimeout(() => {
        setIsRecording(false);
        setTranscript("A Revolução Industrial começou na Inglaterra por causa da abundância de carvão mineral, capitalismo nascente e o êxodo rural causado pelos cercamentos das terras.");
        toast.success("Áudio gravado e transcrito pela IA!");
      }, 4000);
    } else {
      setIsRecording(false);
    }
  }

  async function handleAnalyze() {
    if (!topic.trim()) return toast.error("Informe o tema da sua explicação.");
    if (!transcript.trim()) return toast.error("Grave sua explicação em áudio primeiro.");

    setLoading(true);
    try {
      const res = await runAnalysis({ data: { topic, transcript } });
      setResult(res);
      toast.success("Análise de Feynman concluída!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro na análise.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Caderno de Áudio & Método Feynman"
        subtitle="Grave você mesmo explicando a matéria em voz alta. A IA analisa sua fala e mostra o que você esqueceu de citar!"
      />

      <div className="surface mb-6 p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Tema da Explicação
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: Revolução Industrial / Leis de Newton / Relações Ecológicas"
          className="input-field mb-4 w-full"
        />

        {/* Audio Recording Controls */}
        <div className="mb-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center">
          <button
            onClick={toggleRecord}
            className={`flex h-16 w-16 items-center justify-center rounded-full transition ${
              isRecording
                ? "bg-red-600 text-white animate-pulse"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {isRecording ? <Square size={24} /> : <Mic size={24} />}
          </button>
          <p className="mt-3 text-xs font-medium text-neutral-500">
            {isRecording ? "Gravando sua voz... (Fale por até 2 minutos)" : "Clique para começar a falar e explicar a matéria"}
          </p>
        </div>

        {transcript && (
          <div className="mb-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-4 text-xs">
            <span className="font-bold text-neutral-500 uppercase block mb-1">Transcrição do seu Áudio:</span>
            <p className="italic text-neutral-700 dark:text-neutral-200">"{transcript}"</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !transcript}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Sparkles size={16} className="animate-spin" /> Analisando seu conhecimento com IA…
            </>
          ) : (
            <>
              <Volume2 size={16} /> Analisar minha Explicação com IA
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="fade-up space-y-4">
          <div className="surface flex items-center justify-between p-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Nota de Domínio (Método Feynman)</div>
              <h2 className="mt-1 text-4xl font-extrabold sm:text-5xl">{result.score} / 10</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} /> O que você explicou Perfeitamente
              </div>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                {result.accuratePoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span> {pt}
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                <AlertCircle size={16} /> O que Faltou você Citar
              </div>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                {result.missingConcepts.map((m, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="surface p-5">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">Conselho da IA para Fixar</div>
            <p className="text-sm leading-relaxed">{result.aiAdvice}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
