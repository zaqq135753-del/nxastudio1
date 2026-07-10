import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { generateVocab, listVocab, deleteVocab, getLangProfile, LANGS, type VocabItem } from "@/lib/fluency.functions";
import { Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/fluencyia/vocabulario")({
  component: VocabPage,
});

type Row = VocabItem & { id: string };

function VocabPage() {
  const [profile, setProfile] = useState<{ target_lang: string; level: string } | null>(null);
  const [topic, setTopic] = useState("");
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useServerFn(getLangProfile);
  const gen = useServerFn(generateVocab);
  const list = useServerFn(listVocab);
  const del = useServerFn(deleteVocab);

  useEffect(() => {
    (async () => {
      const p = await fetchProfile();
      setProfile(p as never);
      const rows = await list({ data: { targetLang: (p as { target_lang?: string })?.target_lang ?? "en" } });
      setItems(rows as Row[]);
    })();
  }, [fetchProfile, list]);

  async function generate() {
    if (!topic.trim()) return toast.error("Informe um tema");
    setLoading(true);
    try {
      await gen({ data: { targetLang: profile?.target_lang ?? "en", level: profile?.level ?? "A1", topic, count: 8 } });
      const rows = await list({ data: { targetLang: profile?.target_lang ?? "en" } });
      setItems(rows as Row[]);
      setTopic("");
      toast.success("Vocabulário adicionado");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  async function remove(id: string) {
    await del({ data: { id } });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const langName = LANGS[profile?.target_lang ?? "en"] ?? "Inglês";

  return (
    <AppShell appSlug="fluencyia">
      <ScreenHeader title="Vocabulário" subtitle={`Seu banco de palavras em ${langName}`} />

      <div className="surface p-4 mb-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="Tema (ex.: aeroporto, entrevista de emprego)"
            className="input-field flex-1" />
          <button onClick={generate} disabled={loading} className="btn-primary">
            <Sparkles size={14} /> {loading ? "Gerando…" : "Gerar 8 palavras"}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="surface p-5 text-center text-sm" style={{ color: "var(--n-500)" }}>
          Nenhuma palavra salva ainda.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="surface flex items-start justify-between p-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{it.term} <span className="ml-2 text-sm font-normal" style={{ color: "var(--n-500)" }}>{it.translation}</span></div>
                {it.example && <div className="mt-1 text-sm italic" style={{ color: "var(--n-500)" }}>{it.example}</div>}
              </div>
              <button onClick={() => remove(it.id)} className="ml-2 p-1" title="Remover"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
