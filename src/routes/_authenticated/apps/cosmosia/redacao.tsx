import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { correctEssay, type EssayCorrection } from "@/lib/estudantil.functions";
import { PenLine, Sparkles, CheckCircle2, AlertCircle, Award } from "lucide-react";
import { PromoUpsellModal } from "@/components/commerce/PromoUpsellModal";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/redacao")({
  component: RedacaoPage,
});

function RedacaoPage() {
  const [theme, setTheme] = useState("");
  const [essayText, setEssayText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EssayCorrection | null>(null);
  const [showPromo, setShowPromo] = useState(false);

  const runCorrection = useServerFn(correctEssay);

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
        title="Corretor de Redação ENEM"
        subtitle="Receba sua nota de 0 a 1000 dividida pelas 5 competências oficiais em segundos."
      />

      <div className="surface mb-6 p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Tema da Redação
        </label>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Ex: Desafios para a preservação da saúde mental entre os jovens no Brasil"
          className="input-field mb-4 w-full"
        />

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Texto da sua Redação
        </label>
        <textarea
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder="Cole seu texto de redação completo aqui..."
          rows={10}
          className="input-field mb-4 w-full"
        />

        <button
          onClick={handleCorrect}
          disabled={loading}
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
