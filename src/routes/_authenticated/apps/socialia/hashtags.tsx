import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import {
  generateHashtags, saveHashtagSet, listHashtagSets, type HashtagItem,
} from "@/lib/social.functions";
import { Sparkles, Copy, Save, Hash } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/socialia/hashtags")({
  component: Hashtags,
});

function Hashtags() {
  const [form, setForm] = useState({
    niche: "", theme: "", location: "", language: "Português", quantity: 15,
  });
  const [results, setResults] = useState<HashtagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sets, setSets] = useState<{ id: string; name: string; hashtags: unknown }[]>([]);
  const gen = useServerFn(generateHashtags);
  const save = useServerFn(saveHashtagSet);
  const list = useServerFn(listHashtagSets);

  useEffect(() => { list().then(setSets); }, [list]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.niche.trim() || !form.theme.trim()) return toast.error("Nicho e tema são obrigatórios.");
    setLoading(true);
    try { setResults(await gen({ data: form })); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  async function saveSet() {
    if (!results.length) return;
    const name = prompt("Nome do conjunto:", `${form.theme} · ${form.niche}`);
    if (!name) return;
    await save({ data: { name, hashtags: results } });
    toast.success("Salvo");
    setSets(await list());
  }

  function copyAll() {
    navigator.clipboard.writeText(results.map((r) => r.tag).join(" "));
    toast.success("Todas copiadas");
  }

  return (
    <AppShell appSlug="socialia">
      <ScreenHeader title="Hashtags" subtitle="Populares + específicas. Sem hashtags banidas." />

      <form onSubmit={submit} className="surface space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nicho" value={form.niche} onChange={(v) => setForm({ ...form, niche: v })} />
          <Field label="Tema do post" value={form.theme} onChange={(v) => setForm({ ...form, theme: v })} />
          <Field label="Localização (opcional)" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <label className="block">
            <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Idioma</div>
            <select className="input-field w-full" value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}>
              {["Português", "Inglês", "Espanhol", "Misto"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        </div>
        <label className="block">
          <div className="mb-1 flex items-center justify-between text-xs" style={{ color: "var(--n-500)" }}>
            <span>Quantidade</span><span>{form.quantity}</span>
          </div>
          <input type="range" min={5} max={30} value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            className="w-full" />
        </label>
        <button className="btn-primary w-full" disabled={loading}>
          <Sparkles size={14} /> {loading ? "Gerando…" : "Gerar hashtags"}
        </button>
      </form>

      {loading && <div className="mt-4"><TypingIndicator label="Escolhendo as melhores…" /></div>}

      {results.length > 0 && (
        <section className="fade-up mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="edition-tag">{results.length} hashtags</div>
            <div className="flex gap-2">
              <button onClick={copyAll} className="btn-ghost text-sm"><Copy size={14} /> Copiar todas</button>
              <button onClick={saveSet} className="btn-ghost text-sm"><Save size={14} /> Salvar</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {results.map((h) => (
              <button key={h.tag}
                onClick={() => { navigator.clipboard.writeText(h.tag); toast.success(`${h.tag} copiada`); }}
                className="rounded-full border px-3 py-1.5 text-sm transition-all"
                style={{
                  borderColor: "var(--line-1)",
                  background: h.category === "popular" ? "var(--n-100)" : "transparent",
                }}
                title={`${h.category} · alcance ${h.estimatedReach}`}>
                {h.tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {sets.length > 0 && (
        <section className="mt-8">
          <div className="edition-tag mb-3">Conjuntos salvos</div>
          <div className="space-y-2">
            {sets.map((s) => {
              const tags = Array.isArray(s.hashtags) ? (s.hashtags as HashtagItem[]) : [];
              return (
                <div key={s.id} className="surface p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <Hash size={14} style={{ color: "var(--n-500)" }} /> {s.name}
                    </div>
                    <button className="chip chip-neutral text-[10px]"
                      onClick={() => { navigator.clipboard.writeText(tags.map((t) => t.tag).join(" ")); toast.success("Copiado"); }}>
                      <Copy size={10} className="mr-1 inline" />Copiar
                    </button>
                  </div>
                  <div className="text-xs" style={{ color: "var(--n-500)" }}>
                    {tags.slice(0, 8).map((t) => t.tag).join(" ")}{tags.length > 8 ? "…" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
      <input className="input-field w-full" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
