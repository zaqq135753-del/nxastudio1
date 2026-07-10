import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { compatibility, type Compatibility } from "@/lib/cosmos.functions";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/compatibilidade")({
  component: Compat,
});

function Compat() {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [result, setResult] = useState<(Compatibility & { partner_sign: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const fn = useServerFn(compatibility);

  async function run() {
    if (!name || !birth) return toast.error("Preencha nome e data.");
    setLoading(true);
    try { setResult(await fn({ data: { partner_name: name, partner_birth_date: birth } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader title="Compatibilidade" subtitle="Sinastria com base no signo solar." />

      <div className="surface mb-4 p-4 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do outro" className="input-field w-full" />
        <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="input-field w-full" />
        <button onClick={run} disabled={loading} className="btn-primary">
          <Heart size={14} /> {loading ? "Calculando…" : "Ver compatibilidade"}
        </button>
      </div>

      {result && (
        <div className="fade-up space-y-4">
          <div className="surface p-5 text-center">
            <div className="text-xs uppercase" style={{ color: "var(--n-500)" }}>
              Você × {name} <span className="capitalize">({result.partner_sign})</span>
            </div>
            <div className="mt-2 text-5xl font-bold tracking-tight" style={{ color: "var(--c-orange)" }}>
              {result.overall_score}%
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Metric label="💕 Amor" v={result.love} />
            <Metric label="🤝 Amizade" v={result.friendship} />
            <Metric label="💬 Comunicação" v={result.communication} />
          </div>

          <div className="surface p-5">
            <div className="edition-tag mb-2">✨ Pontos fortes</div>
            <ul className="space-y-1 text-sm">{result.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
          <div className="surface p-5">
            <div className="edition-tag mb-2">⚠️ Desafios</div>
            <ul className="space-y-1 text-sm">{result.challenges.map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
          <div className="surface p-5">
            <div className="edition-tag mb-2">💫 Veredito</div>
            <p className="text-sm">{result.verdict}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Metric({ label, v }: { label: string; v: number }) {
  return (
    <div className="surface p-3">
      <div className="text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
      <div className="text-xl font-bold tracking-tight">{v}%</div>
      <div className="mt-1 h-1.5 rounded-full" style={{ background: "var(--n-100)" }}>
        <div className="h-full rounded-full" style={{ width: `${v}%`, background: "var(--c-orange)" }} />
      </div>
    </div>
  );
}
