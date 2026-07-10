import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { saveOnboarding } from "@/lib/onboarding.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

type Step = {
  q: string;
  hint: string;
  suggestions: string[];
};

const STEPS: Step[] = [
  { q: "Como você quer que a NXA te chame?", hint: "Só um apelido curto.", suggestions: [] },
  { q: "Qual seu maior objetivo agora?", hint: "Uma frase basta.", suggestions: ["Perder peso", "Organizar minhas finanças", "Aprender inglês", "Cuidar melhor do meu pet"] },
  { q: "Você tem alguma restrição alimentar?", hint: "Alergias, dietas, o que evita.", suggestions: ["Nenhuma", "Sem lactose", "Vegetariano", "Sem glúten"] },
  { q: "Como está sua rotina hoje?", hint: "Trabalho, exercícios, sono.", suggestions: ["Corrida", "CLT + academia", "Freela + estudo", "Home office sedentário"] },
  { q: "O que te dá mais prazer no dia a dia?", hint: "Ajuda a personalizar sugestões.", suggestions: ["Cozinhar", "Viajar", "Skincare", "Séries"] },
  { q: "Do que você quer FUGIR?", hint: "Sabor, hábito, sensação.", suggestions: ["Comida ultraprocessada", "Ansiedade financeira", "Sedentarismo", "Dívidas"] },
];

function Onboarding() {
  const nav = useNavigate();
  const save = useServerFn(saveOnboarding);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(STEPS.length).fill(""));
  const [saving, setSaving] = useState(false);

  const step = STEPS[i];
  const val = answers[i];
  const last = i === STEPS.length - 1;

  function set(v: string) {
    setAnswers((a) => a.map((x, k) => (k === i ? v : x)));
  }

  async function next() {
    if (!val.trim()) return;
    if (!last) { setI(i + 1); return; }
    setSaving(true);
    try {
      await save({
        data: {
          answers: STEPS.map((s, k) => ({ question: s.q, answer: answers[k] || "" })).filter((a) => a.answer.trim()),
        },
      });
      toast.success("Personalização concluída");
      nav({ to: "/hub", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-aurora relative overflow-hidden">
      <span className="aurora-orb aurora-orb-1 pointer-events-none absolute" />
      <span className="aurora-orb aurora-orb-2 pointer-events-none absolute" />

      <div className="relative mx-auto max-w-xl px-5 pt-16 pb-24">
        <div className="mb-8 flex items-center justify-between text-xs" style={{ color: "var(--n-500)" }}>
          <span className="inline-flex items-center gap-1.5"><Sparkles size={13} /> Personalização NXA</span>
          <span>{i + 1} / {STEPS.length}</span>
        </div>

        <div className="mb-8 h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--n-100)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--text-1)" }}
            animate={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
              {step.q}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--n-500)" }}>{step.hint}</p>

            <textarea
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder="Escreva aqui..."
              rows={3}
              className="mt-6 w-full resize-none rounded-2xl border bg-transparent px-4 py-3 text-[15px] outline-none transition focus:ring-2"
              style={{
                borderColor: "var(--line-1)",
                color: "var(--text-1)",
              }}
              autoFocus
            />

            {step.suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {step.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set(s)}
                    className="press rounded-full border px-3 py-1.5 text-xs transition hover:bg-[var(--n-100)]"
                    style={{ borderColor: "var(--line-1)", color: "var(--n-600)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (i > 0 ? setI(i - 1) : nav({ to: "/hub" }))}
            className="text-sm underline-offset-4 hover:underline"
            style={{ color: "var(--n-500)" }}
          >
            {i === 0 ? "Pular por agora" : "Voltar"}
          </button>

          <button
            type="button"
            onClick={next}
            disabled={!val.trim() || saving}
            className="press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
            style={{ background: "var(--text-1)", color: "var(--bg-1)" }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : last ? <Check size={16} /> : <ArrowRight size={16} />}
            {last ? "Concluir" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
