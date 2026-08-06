import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { correctEssay, transcribeEssayOcr, type EssayCorrection } from "@/lib/estudantil.functions";
import { PenLine, Sparkles, CheckCircle2, AlertCircle, Award, Camera, Upload, FileText, FileSearch } from "lucide-react";
import { PromoUpsellModal } from "@/components/commerce/PromoUpsellModal";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/redacao")({
  component: RedacaoPage,
});

function RedacaoPage() {
  const [theme, setTheme] = useState("");
  const [essayText, setEssayText] = useState("");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [result, setResult] = useState<EssayCorrection | null>(null);
  const [showPromo, setShowPromo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const runCorrection = useServerFn(correctEssay);
  const runOcr = useServerFn(transcribeEssayOcr);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, isCamera = false) {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    toast.info(isCamera ? "Analisando caligrafia da foto com IA Visão..." : "Lendo documento/foto...");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setUploadedImage(base64Data);

      try {
        const res = await runOcr({ data: { imageBase64: base64Data } });
        setTranscription(res.transcription);
        setEssayText(res.transcription);
        toast.success("Transcrição da folha concluída com sucesso!");
      } catch (err) {
        toast.error("Não foi possível transcrever a imagem. Digite ou cole seu texto.");
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleCorrect() {
    if (!theme.trim()) return toast.error("Informe o tema da redação.");
    if (essayText.trim().length < 100) return toast.error("Digite ou cole sua redação (mínimo de 100 caracteres).");

    setLoading(true);
    try {
      const data = await runCorrection({ data: { theme, essayText } });
      setResult(data);
      toast.success("Redação analisada com sucesso!");
      setTimeout(() => setShowPromo(true), 2500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao analisar redação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader
        title="Corretor de Redação ENEM (Texto, Foto ou PDF)"
        subtitle="Digite, tire foto da folha manuscrita ou envie um PDF para receber a nota oficial em segundos."
      />

      <div className="surface mb-6 p-5">
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileUpload(e, true)}
          className="hidden"
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => handleFileUpload(e, false)}
          className="hidden"
        />
        <input
          type="file"
          ref={pdfInputRef}
          accept=".pdf"
          onChange={(e) => handleFileUpload(e, false)}
          className="hidden"
        />

        {/* Action Bar for Photo/Camera/PDF */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={ocrLoading}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 transition text-center"
          >
            <Camera size={20} className="text-indigo-500 mb-1" />
            <span className="text-[11px] font-bold">Tirar Foto</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={ocrLoading}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 transition text-center"
          >
            <Upload size={20} className="text-emerald-500 mb-1" />
            <span className="text-[11px] font-bold">Galeria Foto</span>
          </button>

          <button
            onClick={() => pdfInputRef.current?.click()}
            disabled={ocrLoading}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 transition text-center"
          >
            <FileText size={20} className="text-amber-500 mb-1" />
            <span className="text-[11px] font-bold">Upload PDF</span>
          </button>
        </div>

        {ocrLoading && (
          <div className="mb-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold flex items-center justify-center gap-2.5">
            <Sparkles size={18} className="animate-spin text-amber-400" />
            <span>Processando Visão Computacional OCR (Transcrevendo Caligrafia da Folha Manuscrita)...</span>
          </div>
        )}

        {transcription && (
          <div className="mb-5 p-4 rounded-2xl bg-neutral-900 border border-neutral-700/60 text-white fade-up space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-400">
                <FileSearch size={16} /> Transcrição Automática da Folha Manuscrita (IA Visão)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                Caligrafia Lida
              </span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-300 italic bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/40">
              "{transcription}"
            </p>
            <div className="text-[10px] text-neutral-400">
              💡 *Você pode ajustar ou editar qualquer palavra no campo de texto abaixo antes de clicar em Analisar.*
            </div>
          </div>
        )}

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Tema da Redação
        </label>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Ex: Invisibilidade e trabalho de cuidado realizado pela mulher no Brasil"
          className="input-field mb-4 w-full"
        />

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Texto da sua Redação (Digitado ou Transcrito)
        </label>
        <textarea
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder="Cole seu texto de redação completo aqui ou envie a foto da folha acima..."
          rows={10}
          className="input-field mb-4 w-full"
        />

        <button
          onClick={handleCorrect}
          disabled={loading || ocrLoading}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Sparkles size={16} className="animate-spin" /> Analisando competências…
            </>
          ) : (
            <>
              <PenLine size={16} /> Analisar Redação Agora
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="fade-up space-y-6">
          {/* Total Score Badge */}
          <div className="surface flex items-center justify-between p-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Nota Estimada ENEM</div>
              <h2 className="mt-1 text-4xl font-extrabold sm:text-5xl">{result.totalScore} / 1000</h2>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Award size={32} />
            </div>
          </div>

          {/* Competencies Breakdown */}
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(result.competencies).map(([comp, val], idx) => (
              <div key={comp} className="surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-neutral-500">Competência {idx + 1}</span>
                  <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-extrabold">
                    {val.score} / 200 pts
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{val.feedback}</p>
              </div>
            ))}
          </div>

          {/* General Feedback */}
          <div className="surface p-5">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">Diagnóstico Geral</div>
            <p className="text-sm leading-relaxed">{result.generalFeedback}</p>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} /> Pontos Fortes
              </div>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                <AlertCircle size={16} /> O que Corrigir
              </div>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span> {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <PromoUpsellModal open={showPromo} onOpenChange={setShowPromo} />
    </AppShell>
  );
}
