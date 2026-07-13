import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { APP_ONBOARDING, type OnboardingStep } from "@/apps/onboarding";
import { hasAppOnboarded, saveAppOnboarding } from "@/lib/app-onboarding.functions";

type Props = { slug: string };

/**
 * Wizard de onboarding por app. Aparece automaticamente na 1ª visita.
 * Persiste em `app_onboarding` e não repete.
 */
export function AppOnboarding({ slug }: Props) {
  const cfg = APP_ONBOARDING[slug];
  const qc = useQueryClient();
  const check = useServerFn(hasAppOnboarded);
  const save = useServerFn(saveAppOnboarding);

  const q = useQuery({
    queryKey: ["app-onboarded", slug],
    queryFn: () => check({ data: { appSlug: slug } }),
    enabled: Boolean(cfg),
    staleTime: 5 * 60_000,
  });

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [skipped, setSkipped] = useState(false);

  const mut = useMutation({
    mutationFn: (payload: Record<string, string | string[]>) =>
      save({ data: { appSlug: slug, answers: payload } }),
    onSuccess: () => {
      toast.success("Personalização salva");
      void qc.invalidateQueries({ queryKey: ["app-onboarded", slug] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar"),
  });

  if (!cfg || q.isLoading || q.data?.onboarded || skipped) return null;

  const step: OnboardingStep = cfg.steps[i];
  const val = answers[step.key];
  const last = i === cfg.steps.length - 1;
  const isValid =
    step.type === "multi" ? Array.isArray(val) && val.length > 0 : typeof val === "string" && val.trim().length > 0;

  function pick(v: string) {
    if (step.type === "multi") {
      const cur = Array.isArray(val) ? val : [];
      setAnswers({ ...answers, [step.key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
    } else {
      setAnswers({ ...answers, [step.key]: v });
    }
  }

  async function next() {
    if (!isValid) return;
    if (!last) { setI(i + 1); return; }
    await mut.mutateAsync(answers);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-3xl"
        style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
      >
        <button
          onClick={() => setSkipped(true)}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 opacity-60 hover:opacity-100"
          style={{ color: "var(--text-1)" }}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="px-6 pt-8 pb-6">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--n-500)" }}>
            <Sparkles size={13} /> {i + 1}/{cfg.steps.length}
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>{cfg.title}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--n-500)" }}>{cfg.subtitle}</p>

          <div className="mt-5 h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--n-100)" }}>
            <motion.div
              className="h-full"
              style={{ background: "var(--text-1)" }}
              animate={{ width: `${((i + 1) / cfg.steps.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="mt-6"
            >
              <div className="text-[15px] font-medium" style={{ color: "var(--text-1)" }}>{step.question}</div>
              {step.hint && <div className="mt-1 text-xs" style={{ color: "var(--n-500)" }}>{step.hint}</div>}

              {step.type === "text" ? (
                <input
                  autoFocus
                  value={typeof val === "string" ? val : ""}
                  onChange={(e) => setAnswers({ ...answers, [step.key]: e.target.value })}
                  placeholder={step.placeholder}
                  className="mt-4 w-full rounded-2xl border bg-transparent px-4 py-3 text-[15px] outline-none focus:ring-2"
                  style={{ borderColor: "var(--line-1)", color: "var(--text-1)" }}
                />
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(step.options ?? []).map((opt) => {
                    const active = step.type === "multi"
                      ? Array.isArray(val) && val.includes(opt)
                      : val === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => pick(opt)}
                        className="press rounded-full border px-4 py-2 text-sm transition"
                        style={{
                          borderColor: active ? "var(--text-1)" : "var(--line-1)",
                          background: active ? "var(--text-1)" : "transparent",
                          color: active ? "var(--bg-1)" : "var(--text-1)",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => (i > 0 ? setI(i - 1) : setSkipped(true))}
              className="text-sm hover:underline"
              style={{ color: "var(--n-500)" }}
            >
              {i === 0 ? "Pular por agora" : "Voltar"}
            </button>

            <button
              type="button"
              onClick={next}
              disabled={!isValid || mut.isPending}
              className="press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
              style={{ background: "var(--text-1)", color: "var(--bg-1)" }}
            >
              {mut.isPending ? <Loader2 size={16} className="animate-spin" /> : last ? <Check size={16} /> : <ArrowRight size={16} />}
              {last ? "Concluir" : "Continuar"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
