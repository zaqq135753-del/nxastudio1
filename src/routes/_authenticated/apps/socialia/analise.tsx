import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { analyzeProfile, type ProfileAnalysis } from "@/lib/social.functions";
import { Sparkles, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/socialia/analise")({
  component: Analise,
});

function Analise() {
  const [form, setForm] = useState({
    profileUrl: "", platform: "Instagram", bio: "", recentPosts: "",
  });
  const [result, setResult] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const run = useServerFn(analyzeProfile);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.profileUrl.trim()) return toast.error("Informe a URL do perfil.");
    setLoading(true);
    try { setResult(await run({ data: form })); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="socialia">
      <ScreenHeader title="Análise de perfil" subtitle="Diagnóstico da IA + ações práticas priorizadas." />

      <form onSubmit={submit} className="surface space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block sm:col-span-2">
            <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>URL do perfil</div>
            <input className="input-field w-full" value={form.profileUrl}
              onChange={(e) => setForm({ ...form, profileUrl: e.target.value })}
              placeholder="instagram.com/seuperfil" />
          </label>
          <label className="block">
            <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Plataforma</div>
            <select className="input-field w-full" value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {["Instagram", "TikTok", "Facebook", "LinkedIn"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        </div>
        <label className="block">
          <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Bio atual (cole aqui)</div>
          <textarea rows={2} className="input-field w-full" value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>
        <label className="block">
          <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Descreva 3-5 posts recentes</div>
          <textarea rows={3} className="input-field w-full" value={form.recentPosts}
            onChange={(e) => setForm({ ...form, recentPosts: e.target.value })}
            placeholder="Ex.: reels com dicas, foto do produto, story com bastidor…" />
        </label>
        <button className="btn-primary w-full" disabled={loading}>
          <Search size={14} /> {loading ? "Analisando…" : "Analisar perfil"}
        </button>
      </form>

      {loading && <div className="mt-4"><TypingIndicator label="Estudando o perfil…" /></div>}

      {result && (
        <section className="fade-up mt-6 space-y-4">
          <div className="surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="edition-tag">Bio</div>
              <div className="text-sm">
                <span className="font-bold">{result.bio.score}</span>
                <span style={{ color: "var(--n-500)" }}> / 10</span>
              </div>
            </div>
            <p className="text-sm">{result.bio.feedback}</p>
            <div className="mt-3 rounded-xl border p-3 text-sm" style={{ borderColor: "var(--line-1)" }}>
              <div className="mb-1 text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>
                Sugestão de bio
              </div>
              {result.bio.suggestion}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface p-5">
              <div className="edition-tag mb-2">Pontos fortes</div>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {result.content.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="surface p-5">
              <div className="edition-tag mb-2">A melhorar</div>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {result.content.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          <div className="surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="edition-tag">Engajamento</div>
              <div className="text-sm font-medium">{result.engagement.estimatedRate}</div>
            </div>
            <p className="text-sm">{result.engagement.feedback}</p>
          </div>

          {result.opportunities?.length > 0 && (
            <div className="surface p-5">
              <div className="edition-tag mb-2">Oportunidades</div>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {result.opportunities.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          )}

          <div className="surface p-5">
            <div className="edition-tag mb-3">Ações recomendadas</div>
            <div className="space-y-2">
              {result.actions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border p-3 text-sm"
                  style={{ borderColor: "var(--line-1)" }}>
                  <span className="mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                    style={{
                      background: a.priority === "high" ? "var(--c-orange)" : "var(--n-100)",
                      color: a.priority === "high" ? "#fff" : "var(--n-700)",
                    }}>{a.priority}</span>
                  <span>{a.action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border p-3 text-xs" style={{ borderColor: "var(--line-1)", color: "var(--n-500)" }}>
            <Sparkles size={12} /> Análise baseada nas informações que você forneceu. Quanto mais detalhes, mais preciso o diagnóstico.
          </div>
        </section>
      )}
    </AppShell>
  );
}
