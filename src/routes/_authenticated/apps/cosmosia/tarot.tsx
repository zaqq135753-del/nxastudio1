import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { drawTarot, listTarotHistory, type TarotReading } from "@/lib/cosmos.functions";
import { Sparkle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/tarot")({
  component: TarotPage,
});

type HistoryItem = { id: string; question: string | null; spread: string; interpretation: string; created_at: string };

function TarotPage() {
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<"single" | "three">("three");
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const draw = useServerFn(drawTarot);
  const hist = useServerFn(listTarotHistory);

  useEffect(() => { hist().then((r) => setHistory(r as HistoryItem[])); }, [hist]);

  async function tirar() {
    if (!question.trim()) return toast.error("Faça uma pergunta primeiro.");
    setLoading(true);
    try {
      const r = await draw({ data: { question, spread } });
      setReading(r);
      hist().then((r2) => setHistory(r2 as HistoryItem[]));
    }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader title="Tarot" subtitle="Faça uma pergunta e deixe as cartas guiarem." />

      <div className="surface mb-4 p-4">
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
          placeholder="O que você quer saber? Ex: como será minha semana no trabalho?"
          className="input-field mb-3 w-full" rows={2} />
        <div className="mb-3 flex gap-2">
          <button onClick={() => setSpread("single")} className="chip"
            style={{ background: spread === "single" ? "var(--c-orange)" : "var(--n-100)", color: spread === "single" ? "#fff" : "var(--n-700)" }}>1 carta</button>
          <button onClick={() => setSpread("three")} className="chip"
            style={{ background: spread === "three" ? "var(--c-orange)" : "var(--n-100)", color: spread === "three" ? "#fff" : "var(--n-700)" }}>Passado · Presente · Futuro</button>
        </div>
        <button onClick={tirar} disabled={loading} className="btn-primary">
          <Sparkle size={14} /> {loading ? "Embaralhando…" : "Tirar cartas"}
        </button>
      </div>

      {reading && (
        <div className="fade-up space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {reading.cards.map((c, i) => (
              <div key={i} className="surface p-4 text-center">
                <div className="text-xs uppercase" style={{ color: "var(--c-orange)" }}>{c.position}</div>
                <div className={`my-3 text-2xl ${c.upright ? "" : "rotate-180"}`}>🎴</div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-[10px] uppercase" style={{ color: "var(--n-500)" }}>
                  {c.upright ? "Direita" : "Invertida"}
                </div>
                <p className="mt-2 text-xs" style={{ color: "var(--n-500)" }}>{c.meaning}</p>
              </div>
            ))}
          </div>
          <div className="surface p-5">
            <div className="edition-tag mb-2">Interpretação</div>
            <p className="text-sm whitespace-pre-wrap">{reading.interpretation}</p>
          </div>
          <div className="surface p-5">
            <div className="edition-tag mb-2">💫 Conselho</div>
            <p className="text-sm">{reading.guidance}</p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <section className="mt-8">
          <div className="edition-tag mb-3">Histórico</div>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="surface p-3 text-sm">
                <div className="text-xs" style={{ color: "var(--n-500)" }}>
                  {new Date(h.created_at).toLocaleDateString("pt-BR")}
                </div>
                <div className="font-medium">{h.question}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
