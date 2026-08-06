import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { generateSkeleton, type EssaySkeleton } from "@/lib/estudantil.functions";
import { Sparkle, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/studyia/esqueletos")({
  component: EsqueletosPage,
});

const THEME_EXAMPLES = [
  { label: "📱 Inteligência Artificial e Empregos", text: "Desafios do impacto da inteligência artificial no mercado de trabalho brasileiro" },
  { label: "🧠 Saúde Mental e Redes Sociais", text: "Caminhos para combater a ansiedade e o vício digital entre os jovens no Brasil" },
  { label: "🌱 Mudanças Climáticas", text: "A urgência da preservação ambiental e transição energética no Brasil contemporâneo" },
  { label: "🎓 Abandono Escolar", text: "Estratégias para combater a evasão no ensino médio público brasileiro" },
  { label: "🏛️ Inclusão de PNEs", text: "Desafios para a inclusão social e acessibilidade de pessoas com deficiência" },
];

function EsqueletosPage() {
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [skeleton, setSkeleton] = useState<EssaySkeleton | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const runSkeleton = useServerFn(generateSkeleton);

  async function handleGenerate(customTheme?: string) {
    const targetTheme = customTheme || theme;
    if (!targetTheme.trim()) return toast.error("Informe o tema para gerar o esqueleto.");

    setLoading(true);
    try {
      const data = await runSkeleton({ data: { theme: targetTheme } });
      setSkeleton(data);
      toast.success("Esqueleto Coringa gerado com sucesso!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar esqueleto.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, section: string) {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success(`Copiado!`);
    setTimeout(() => setCopiedSection(null), 2000);
  }

  return (
    <AppShell appSlug="studyia">
      <ScreenHeader
        title="Esqueletos Coringa de Redação"
        subtitle="Gere a estrutura pronta Nota 900+ completa para qualquer tema com repertórios já encaixados."
      />

      <div className="surface mb-6 p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Tema da Redação (Digite ou Selecione um Exemplo)
        </label>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Ex: O papel da tecnologia na transformação da educação básica no Brasil"
          className="input-field mb-4 w-full"
        />

        {/* Sugestões de Temas Rápidos */}
        <div className="mb-5">
          <span className="text-[11px] font-extrabold uppercase text-neutral-400 block mb-2">
            💡 Sugestões de Temas Quentes do ENEM:
          </span>
          <div className="flex flex-wrap gap-2">
            {THEME_EXAMPLES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTheme(item.text);
                }}
                className={`px-3 py-1.5 rounded-full border transition text-xs font-semibold ${
                  theme === item.text
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                    : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
        >
          {loading ? (
            <>
              <Sparkles size={16} className="animate-spin text-amber-300" /> Montando esqueleto coringa…
            </>
          ) : (
            <>
              <Sparkle size={16} /> Gerar Esqueleto Pronto
            </>
          )}
        </button>
      </div>

      {skeleton && (
        <div className="fade-up space-y-4">
          {/* Repertoires */}
          <div className="surface p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Repertórios Sociológicos Inclusos</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {skeleton.repertoires.map((rep, idx) => (
                <span key={idx} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  📚 {rep}
                </span>
              ))}
            </div>
          </div>

          {/* Intro */}
          <div className="surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-neutral-500">Introdução</span>
              <button
                onClick={() => copyToClipboard(skeleton.introduction, "intro")}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                {copiedSection === "intro" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} Copiar
              </button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{skeleton.introduction}</p>
          </div>

          {/* D1 */}
          <div className="surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-neutral-500">Desenvolvimento 1 (Causa & Repertório)</span>
              <button
                onClick={() => copyToClipboard(skeleton.development1, "d1")}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                {copiedSection === "d1" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} Copiar
              </button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{skeleton.development1}</p>
          </div>

          {/* D2 */}
          <div className="surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-neutral-500">Desenvolvimento 2 (Consequência)</span>
              <button
                onClick={() => copyToClipboard(skeleton.development2, "d2")}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                {copiedSection === "d2" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} Copiar
              </button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{skeleton.development2}</p>
          </div>

          {/* Conclusion */}
          <div className="surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-neutral-500">Conclusão (Proposta de Intervenção Completa)</span>
              <button
                onClick={() => copyToClipboard(skeleton.conclusion, "conc")}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                {copiedSection === "conc" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} Copiar
              </button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{skeleton.conclusion}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
