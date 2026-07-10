import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const goals = [
  { v: "saudavel",       label: "Comer melhor", emoji: "🥗" },
  { v: "emagrecimento",  label: "Emagrecer", emoji: "⚖️" },
  { v: "ganho_massa",    label: "Ganhar massa", emoji: "💪" },
  { v: "economia",       label: "Economizar", emoji: "💸" },
  { v: "pratico",        label: "Praticidade", emoji: "⚡" },
  { v: "gourmet",        label: "Cozinha gourmet", emoji: "👨‍🍳" },
] as const;

const levels = [
  { v: "iniciante",     label: "Iniciante" },
  { v: "intermediario", label: "Intermediário" },
  { v: "avancado",      label: "Avançado" },
] as const;

const restrictionOptions = ["Vegetariano", "Vegano", "Sem glúten", "Sem lactose", "Low carb", "Diabetes", "Halal", "Kosher"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<(typeof goals)[number]["v"]>("saudavel");
  const [level, setLevel] = useState<(typeof levels)[number]["v"]>("intermediario");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [loves, setLoves] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [household, setHousehold] = useState(2);
  const [budget, setBudget] = useState("R$150-R$300");
  const [saving, setSaving] = useState(false);

  const toggle = (r: string) =>
    setRestrictions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  async function finish() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user!.id;
    const { error: e1 } = await supabase.from("palate_profile").upsert({
      user_id: uid,
      goal, cooking_level: level,
      restrictions,
      loves:    loves.split(",").map((s) => s.trim()).filter(Boolean),
      dislikes: dislikes.split(",").map((s) => s.trim()).filter(Boolean),
      household_size: household,
      budget_weekly: budget,
    });
    const { error: e2 } = await supabase.from("profiles").update({ onboarded: true }).eq("id", uid);
    setSaving(false);
    if (e1 || e2) return toast.error("Não deu pra salvar. Tenta de novo.");
    toast.success("Perfil de paladar criado!");
    navigate({ to: "/app" });
  }

  const steps = [
    {
      title: "Qual seu objetivo agora?",
      sub: "Isso define o tom das receitas.",
      body: (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {goals.map((g) => (
            <button key={g.v} onClick={() => setGoal(g.v)}
              className={`card-editorial p-4 text-left ${goal === g.v ? "ring-2" : ""}`}
              style={{ ...(goal === g.v ? { boxShadow: "0 0 0 2px var(--saffron)" } : {}) }}>
              <div className="text-2xl">{g.emoji}</div>
              <div className="mt-2 font-medium">{g.label}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Como você se sai na cozinha?",
      sub: "Vamos calibrar dificuldade e tempo.",
      body: (
        <div className="flex flex-wrap gap-2">
          {levels.map((l) => (
            <button key={l.v} onClick={() => setLevel(l.v)} className={`chip chip-neutral ${level === l.v ? "chip-active" : ""}`}>
              {l.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Alguma restrição?",
      sub: "Nunca sugerimos nada que você não come.",
      body: (
        <div className="flex flex-wrap gap-2">
          {restrictionOptions.map((r) => (
            <button key={r} onClick={() => toggle(r)} className={`chip chip-neutral ${restrictions.includes(r) ? "chip-active" : ""}`}>
              {r}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "O que você ama e odeia?",
      sub: "Ingredientes separados por vírgula.",
      body: (
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-xs" style={{ color: "var(--cream-400)" }}>Amo comer</div>
            <input className="input-field" placeholder="massa, alho, limão…" value={loves} onChange={(e) => setLoves(e.target.value)} />
          </div>
          <div>
            <div className="mb-1 text-xs" style={{ color: "var(--cream-400)" }}>Não gosto</div>
            <input className="input-field" placeholder="beringela, coentro…" value={dislikes} onChange={(e) => setDislikes(e.target.value)} />
          </div>
        </div>
      ),
    },
    {
      title: "Casa & orçamento",
      sub: "Pra calibrar quantidades e sugestões de compra.",
      body: (
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-xs" style={{ color: "var(--cream-400)" }}>Pessoas em casa: <b>{household}</b></div>
            <input type="range" min={1} max={8} value={household} onChange={(e) => setHousehold(Number(e.target.value))} className="w-full accent-[var(--saffron)]" />
          </div>
          <div>
            <div className="mb-2 text-xs" style={{ color: "var(--cream-400)" }}>Orçamento semanal</div>
            <div className="flex flex-wrap gap-2">
              {["Até R$150", "R$150-R$300", "R$300-R$500", "Sem limite"].map((b) => (
                <button key={b} onClick={() => setBudget(b)} className={`chip chip-neutral ${budget === b ? "chip-active" : ""}`}>{b}</button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const s = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="mx-auto max-w-xl px-6 pt-16 pb-24 fade-up">
      <div className="edition-tag mb-2">Passo {step + 1} de {steps.length}</div>
      <h1 className="text-4xl">{s.title}</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--cream-400)" }}>{s.sub}</p>

      <div className="mt-8">{s.body}</div>

      <div className="mt-10 flex items-center justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-ghost">Voltar</button>
        {last ? (
          <button onClick={finish} disabled={saving} className="btn-primary">
            {saving ? "Salvando…" : <>Concluir <Sparkles size={16} /></>}
          </button>
        ) : (
          <button onClick={() => setStep(step + 1)} className="btn-primary">Próximo <ArrowRight size={16} /></button>
        )}
      </div>

      <div className="mt-8 h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--ink-800)" }}>
        <div className="h-full transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "var(--saffron)" }} />
      </div>
    </div>
  );
}
