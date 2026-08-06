import { createFileRoute } from '@tanstack/react-router'
import { createFileRoute } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { analyzeAudioExplanation, type AudioAnalysis } from "@/lib/estudantil.functions";
import { getAudioHistory, saveAudioAnalysis, clearAudioHistory } from "@/lib/audio.functions";
import { Mic, Square, Play, Sparkles, CheckCircle2, AlertCircle, Volume2, History, Trash2, Activity } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const Route = createFileRoute("/_authenticated/apps/studyia/audio")({
  component: AudioPage,
});

type AudioEntry = {
  id: string;
  topic: string;
  transcript: string;
  score: number;
  date: string;
  accuratePoints: string[];
  missingConcepts: string[];
  aiAdvice: string;
};

export function AudioPage() {
  const [topic, setTopic] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AudioAnalysis | null>(null);
  const [history, setHistory] = useState<AudioEntry[]>([]);
  
  // Audio Visualizer State
  const [audioData, setAudioData] = useState<number[]>(new Array(30).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const runAnalysis = useServerFn(analyzeAudioExplanation);
  const fetchHistory = useServerFn(getAudioHistory);
  const clearDbHistory = useServerFn(clearAudioHistory);
  const saveDbAnalysis = useServerFn(saveAudioAnalysis);

  useEffect(() => {
    fetchHistory()
      .then((data: any) => setHistory(data))
      .catch(() => {});
  }, [fetchHistory]);

  async function saveToHistory(entry: AudioAnalysis) {
    try {
      await saveDbAnalysis({ data: { topic: topic || "Explicação de Estudos", transcript, analysis: entry } });
      const updated = await fetchHistory();
      setHistory(updated as any);
    } catch (e) {
      toast.error("Erro ao salvar no histórico do banco.");
    }
  }

  async function clearHistory() {
    try {
      await clearDbHistory();
      setHistory([]);
      toast.info("Histórico de áudios limpo do banco de dados.");
    } catch (e) {
      toast.error("Erro ao limpar histórico.");
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const step = Math.floor(dataArray.length / 30);
        const newAudioData = [];
        for (let i = 0; i < 30; i++) {
          newAudioData.push(dataArray[i * step] || 0);
        }
        setAudioData(newAudioData);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = true;

        let fullText = "";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              fullText += event.results[i][0].transcript + " ";
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(fullText + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        toast.warning("Seu navegador não suporta transcrição de voz nativa. Use o Chrome ou Edge.");
      }

      setIsRecording(true);
      setTranscript("");
      setResult(null);
      toast.info("Gravação iniciada! Pode falar...");
    } catch (err) {
      toast.error("Erro ao acessar microfone. Verifique as permissões do seu navegador.");
    }
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setAudioData(new Array(30).fill(0));
    setIsRecording(false);
    toast.success("Gravação concluída!");
  }

  function toggleRecord() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  async function handleAnalyze() {
    if (!topic.trim()) return toast.error("Informe o tema da sua explicação.");
    if (!transcript.trim()) return toast.error("Grave sua explicação em áudio primeiro.");

    if (isRecording) stopRecording();

    setLoading(true);
    try {
      const res = await runAnalysis({ data: { topic, transcript } });
      setResult(res);
      await saveToHistory(res);
      toast.success("Análise de Feynman concluída e salva no banco!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro na análise.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell appSlug="studyia">
      <ScreenHeader
        title="Caderno de Áudio & Banco Feynman"
        subtitle="Grave você mesmo explicando a matéria em voz alta. A IA analisa sua fala e salva todas as suas aulas gravadas!"
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
        <div className="mb-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center transition-all">
          
          {isRecording && (
            <div className="mb-6 flex h-16 w-full max-w-sm items-center justify-center gap-1 rounded-xl bg-neutral-900 px-4 py-2 shadow-inner">
              {audioData.map((val, i) => {
                const height = Math.max(4, (val / 255) * 100);
                return (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-indigo-500 transition-all duration-75"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          )}

          <button
            onClick={toggleRecord}
            className={`flex h-16 w-16 items-center justify-center rounded-full transition-transform active:scale-95 shadow-lg ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/40"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40"
            }`}
          >
            {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
          </button>
          <p className="mt-4 text-xs font-medium text-neutral-500 flex items-center justify-center gap-2">
            {isRecording ? (
              <><Activity size={14} className="text-red-500 animate-pulse" /> Gravando e transcrevendo em tempo real... (Toque para parar)</>
            ) : (
              "Clique no microfone para falar e gravar sua aula"
            )}
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
        <div className="fade-up mb-8 space-y-4">
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

      {/* BANCO DE AULAS GRAVADAS E ANÁLISES SALVAS */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-indigo-500" />
            <h3 className="text-lg font-bold">Banco de Aulas Gravadas & Análises</h3>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-red-500 hover:underline"
            >
              <Trash2 size={14} /> Limpar
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="surface p-6 text-center text-xs text-neutral-500">
            Nenhuma aula gravada no banco ainda. Grave seu primeiro áudio acima para acumular seu acervo de revisões!
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="surface p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">{item.topic}</span>
                  <span className="font-extrabold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                    Nota {item.score}/10
                  </span>
                </div>
                <p className="italic text-neutral-500">"{item.transcript}"</p>
                <div className="text-[10px] text-neutral-400">Gravado em: {item.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
