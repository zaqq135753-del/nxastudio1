import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { agentTurn, runAgentAction, type AgentAction } from "@/lib/agent-actions.functions";
import { Send, Check, X, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MicButton } from "@/components/voice/MicButton";
import { SpeakButton } from "@/components/voice/SpeakButton";

export const Route = createFileRoute("/_authenticated/agente")({
  component: AgentePage,
});

type Turn = {
  role: "user" | "assistant";
  content: string;
  actions?: AgentAction[];
  executed?: Record<number, "ok" | "err">;
};

function AgentePage() {
  const nav = useNavigate();
  const send = useServerFn(agentTurn);
  const run = useServerFn(runAgentAction);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns, loading]);

  const [appSlug, setAppSlug] = useState<string>("cosmosia");

  // Seed vindo do Command Center (hub AICommandBar)
  useEffect(() => {
    const seed = sessionStorage.getItem("nxa:agent:seed");
    const slug = sessionStorage.getItem("nxa:agent:appSlug");
    if (slug) setAppSlug(slug);
    if (seed) {
      sessionStorage.removeItem("nxa:agent:seed");
      setInput(seed);
    }
  }, []);

  async function submit() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    const next: Turn[] = [...turns, { role: "user", content: msg }];
    setTurns(next);
    setLoading(true);
    try {
      const history = turns.map((t) => ({ role: t.role, content: t.content }));
      const res = await send({ data: { message: msg, history } });
      setTurns([...next, { role: "assistant", content: res.reply, actions: res.actions, executed: {} }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally { setLoading(false); }
  }

  async function approve(turnIdx: number, actionIdx: number, action: AgentAction) {
    try {
      const res = await run({ data: { action } });
      toast.success(res.message ?? "Feito");
      setTurns((prev) => prev.map((t, i) => i === turnIdx ? { ...t, executed: { ...(t.executed ?? {}), [actionIdx]: "ok" } } : t));
      const r = res as { route?: string };
      if (r.route) nav({ to: r.route });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
      setTurns((prev) => prev.map((t, i) => i === turnIdx ? { ...t, executed: { ...(t.executed ?? {}), [actionIdx]: "err" } } : t));
    }
  }

  function reject(turnIdx: number, actionIdx: number) {
    setTurns((prev) => prev.map((t, i) => i === turnIdx ? { ...t, executed: { ...(t.executed ?? {}), [actionIdx]: "err" } } : t));
  }

  return (
    <AppShell appSlug={appSlug}>
      <ScreenHeader
        title="NXA Agente"
        subtitle="Fale o que precisa. Eu proponho ações — você confirma."
      />

      <div className="space-y-3 mb-4">
        {turns.length === 0 && !loading && (
          <div className="surface p-5 text-sm space-y-2" style={{ color: "var(--n-500)" }}>
            <div className="flex items-center gap-2 font-medium" style={{ color: "var(--text-1)" }}>
              <Sparkles size={14} /> Experimente
            </div>
            <ul className="space-y-1 list-disc pl-4">
              <li>"Registra R$ 42 de mercado hoje"</li>
              <li>"Marca que treinei hoje"</li>
              <li>"Anota que a Luna comeu 80g de ração"</li>
              <li>"Me leva no Chef"</li>
            </ul>
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`surface p-4 ${t.role === "user" ? "ml-8" : "mr-8"}`}>
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--n-500)" }}>
                {t.role === "user" ? "Você" : "Agente"}
              </div>
              {t.role === "assistant" && <SpeakButton text={t.content} />}
            </div>
            <div className="text-[15px] whitespace-pre-wrap">{t.content}</div>
            {t.actions && t.actions.length > 0 && (
              <div className="mt-3 space-y-2">
                {t.actions.map((a, ai) => {
                  const done = t.executed?.[ai];
                  return (
                    <div key={ai} className="rounded-xl border p-3" style={{ borderColor: "var(--line-1)" }}>
                      <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--n-500)" }}>{a.type.replace(/_/g, " ")}</div>
                      <div className="text-sm mb-2">{describe(a)}</div>
                      {done === "ok" ? (
                        <div className="text-xs text-green-600 inline-flex items-center gap-1"><Check size={12} /> executado</div>
                      ) : done === "err" ? (
                        <div className="text-xs" style={{ color: "var(--n-500)" }}>ignorado</div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => approve(i, ai, a)} className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full">
                            {a.type === "navigate" ? <><ArrowRight size={12} /> Abrir</> : <><Check size={12} /> Confirmar</>}
                          </button>
                          <button onClick={() => reject(i, ai)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border" style={{ borderColor: "var(--line-1)" }}>
                            <X size={12} /> Não
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {loading && <TypingIndicator label="pensando…" />}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-24 left-1/2 z-30 w-full max-w-[820px] -translate-x-1/2 px-4">
        <div className="glass flex items-center gap-2 rounded-full p-2" style={{ boxShadow: "var(--shadow-elev)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Fale ou digite uma ação…"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <MicButton onTranscript={(t) => setInput((v) => (v ? v + " " : "") + t)} disabled={loading} />
          <button onClick={submit} disabled={loading || !input.trim()} className="btn-primary rounded-full !p-2.5">
            <Send size={16} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function describe(a: AgentAction): string {
  switch (a.type) {
    case "add_expense": return `Despesa: ${a.category} — R$ ${a.amount.toFixed(2)}${a.description ? ` (${a.description})` : ""}`;
    case "add_income":  return `Receita: ${a.category} — R$ ${a.amount.toFixed(2)}${a.description ? ` (${a.description})` : ""}`;
    case "log_workout": return `Registrar treino${a.duration_min ? ` — ${a.duration_min}min` : ""}${a.notes ? ` (${a.notes})` : ""}`;
    case "add_pet_health": return `Saúde pet — ${a.kind}: ${a.description}`;
    case "add_pet_meal": return `Refeição pet — ${a.food}${a.amount_g ? ` (${a.amount_g}g)` : ""}`;
    case "navigate": return `Abrir ${a.label} (${a.route})`;
  }
}
