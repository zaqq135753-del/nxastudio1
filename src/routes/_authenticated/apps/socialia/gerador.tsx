import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import {
  generateCaption, generateIdeas, generateVideoScript,
  type CaptionResult, type PostIdea, type VideoScript,
} from "@/lib/social.functions";
import { Copy, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/socialia/gerador")({
  component: Gerador,
});

type Tab = "caption" | "idea" | "video";
const tabs: { id: Tab; label: string }[] = [
  { id: "caption", label: "Legenda" },
  { id: "idea", label: "Ideias" },
  { id: "video", label: "Roteiro" },
];

function Gerador() {
  const [tab, setTab] = useState<Tab>("caption");
  return (
    <AppShell appSlug="socialia">
      <ScreenHeader title="Gerador" subtitle="Escolha o tipo de conteúdo. A IA cuida do copy." />
      <div className="mb-5 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="rounded-full px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? "var(--c-orange)" : "var(--n-100)",
              color: tab === t.id ? "#fff" : "var(--n-700)",
            }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "caption" && <CaptionForm />}
      {tab === "idea" && <IdeaForm />}
      {tab === "video" && <VideoForm />}
    </AppShell>
  );
}

function CaptionForm() {
  const [form, setForm] = useState({
    postType: "Foto", goal: "Engajamento", tone: "Casual",
    description: "", keywords: "", cta: "Comente", length: "Médio (3-5 linhas)",
  });
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(generateCaption);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) return toast.error("Descreva o post.");
    setLoading(true);
    try { setResult(await gen({ data: form })); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <form onSubmit={submit} className="surface space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Tipo" value={form.postType} onChange={(v) => setForm({ ...form, postType: v })}
            options={["Foto", "Carrossel", "Reels", "Story"]} />
          <Select label="Objetivo" value={form.goal} onChange={(v) => setForm({ ...form, goal: v })}
            options={["Engajamento", "Venda", "Educação", "Inspiração", "Entretenimento"]} />
          <Select label="Tom" value={form.tone} onChange={(v) => setForm({ ...form, tone: v })}
            options={["Profissional", "Casual", "Divertido", "Inspirador", "Educativo"]} />
          <Select label="CTA" value={form.cta} onChange={(v) => setForm({ ...form, cta: v })}
            options={["Link na bio", "Comente", "Compartilhe", "Salve", "Nenhum"]} />
          <Select label="Tamanho" value={form.length} onChange={(v) => setForm({ ...form, length: v })}
            options={["Curto (1-2 linhas)", "Médio (3-5 linhas)", "Longo (6+ linhas)"]} />
          <Field label="Palavras-chave" value={form.keywords} onChange={(v) => setForm({ ...form, keywords: v })}
            placeholder="marketing, vendas" />
        </div>
        <label className="block">
          <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Descrição do post</div>
          <textarea rows={3} className="input-field w-full" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ex.: Foto do meu produto novo em uso na cozinha…" />
        </label>
        <button className="btn-primary w-full" disabled={loading}>
          <Sparkles size={14} /> {loading ? "Gerando…" : "Gerar legenda"}
        </button>
      </form>

      {loading && <div className="mt-4"><TypingIndicator label="Escrevendo copy…" /></div>}

      {result && (
        <div className="fade-up surface mt-4 space-y-3 p-5">
          <div className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>Hook</div>
          <div className="font-medium">{result.hook}</div>
          <div className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>Legenda</div>
          <textarea rows={7} className="input-field w-full" defaultValue={result.caption} />
          <div className="flex flex-wrap gap-2">
            {result.hashtags.map((h) => (
              <button key={h} className="chip chip-neutral"
                onClick={() => { navigator.clipboard.writeText(h); toast.success(`${h} copiada`); }}>
                {h}
              </button>
            ))}
          </div>
          {result.tips?.length > 0 && (
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>Dicas</div>
              <ul className="list-inside list-disc text-sm" style={{ color: "var(--n-700)" }}>
                {result.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => {
              navigator.clipboard.writeText(`${result.caption}\n\n${result.hashtags.join(" ")}`);
              toast.success("Copiado");
            }}>
              <Copy size={14} /> Copiar tudo
            </button>
            <button className="btn-ghost" onClick={submit}>
              <RefreshCw size={14} /> Gerar outra
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function IdeaForm() {
  const [niche, setNiche] = useState("");
  const [ideas, setIdeas] = useState<PostIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(generateIdeas);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!niche.trim()) return toast.error("Informe o nicho.");
    setLoading(true);
    try { setIdeas(await gen({ data: { niche, count: 10 } })); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <form onSubmit={submit} className="surface flex flex-col gap-3 p-5 sm:flex-row">
        <input className="input-field flex-1" value={niche} onChange={(e) => setNiche(e.target.value)}
          placeholder="Ex.: consultora de marketing" />
        <button className="btn-primary" disabled={loading}>
          <Sparkles size={14} /> {loading ? "Gerando…" : "Gerar 10 ideias"}
        </button>
      </form>
      {loading && <div className="mt-4"><TypingIndicator label="Brainstorm em andamento…" /></div>}
      {ideas.length > 0 && (
        <div className="mt-4 space-y-2">
          {ideas.map((i, idx) => (
            <div key={idx} className="surface p-4 text-sm">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>{i.type}</span>
                <button className="chip chip-neutral text-[10px]"
                  onClick={() => { navigator.clipboard.writeText(`${i.hook}\n\n${i.idea}\n\n${i.cta}`); toast.success("Copiado"); }}>
                  <Copy size={10} className="mr-1 inline" />Copiar
                </button>
              </div>
              <div className="font-medium">{i.idea}</div>
              <div className="mt-1" style={{ color: "var(--n-500)" }}><b>Hook:</b> {i.hook}</div>
              <div style={{ color: "var(--n-500)" }}><b>CTA:</b> {i.cta}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function VideoForm() {
  const [form, setForm] = useState({ topic: "", goal: "Engajamento", style: "Direto e dinâmico", duration: 30 });
  const [result, setResult] = useState<VideoScript | null>(null);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(generateVideoScript);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topic.trim()) return toast.error("Descreva o tema.");
    setLoading(true);
    try { setResult(await gen({ data: form })); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <form onSubmit={submit} className="surface space-y-3 p-5">
        <Field label="Tema" value={form.topic} onChange={(v) => setForm({ ...form, topic: v })}
          placeholder="Ex.: 3 erros que travam vendas no Instagram" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Select label="Objetivo" value={form.goal} onChange={(v) => setForm({ ...form, goal: v })}
            options={["Engajamento", "Educação", "Venda", "Inspiração"]} />
          <Select label="Estilo" value={form.style} onChange={(v) => setForm({ ...form, style: v })}
            options={["Direto e dinâmico", "Storytelling", "Educativo", "Divertido"]} />
          <label className="block">
            <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Duração (s)</div>
            <input type="number" min={15} max={180} className="input-field w-full" value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
          </label>
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          <Sparkles size={14} /> {loading ? "Gerando…" : "Gerar roteiro"}
        </button>
      </form>

      {loading && <div className="mt-4"><TypingIndicator label="Roteirizando…" /></div>}

      {result && (
        <div className="fade-up surface mt-4 space-y-3 p-5">
          <Section title="Hook (0–3s)">{result.hook}</Section>
          <Section title="Conteúdo">
            <ol className="list-inside list-decimal space-y-1 text-sm">
              {result.content.map((c, i) => <li key={i}>{c}</li>)}
            </ol>
          </Section>
          <Section title="CTA">{result.cta}</Section>
          <button className="btn-ghost" onClick={() => {
            const txt = `HOOK: ${result.hook}\n\n${result.content.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nCTA: ${result.cta}`;
            navigator.clipboard.writeText(txt); toast.success("Copiado");
          }}>
            <Copy size={14} /> Copiar roteiro
          </button>
        </div>
      )}
    </>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
      <input className="input-field w-full" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
      <select className="input-field w-full" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>{title}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
