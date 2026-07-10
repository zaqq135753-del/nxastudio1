import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { addStyleItem, deleteStyleItem, listStyleItems, type StyleItem } from "@/lib/style.functions";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/styleia/armario")({
  component: Armario,
});

const CATS = ["Top", "Calça", "Vestido", "Saia", "Sapato", "Casaco", "Acessório"];

function Armario() {
  const [items, setItems] = useState<StyleItem[]>([]);
  const [form, setForm] = useState({ category: "Top", name: "", color: "" });
  const [filter, setFilter] = useState<string | null>(null);
  const fetchAll = useServerFn(listStyleItems);
  const add = useServerFn(addStyleItem);
  const del = useServerFn(deleteStyleItem);

  useEffect(() => { fetchAll().then((r) => setItems(r as StyleItem[])); }, [fetchAll]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Dê um nome à peça.");
    try {
      const saved = await add({ data: form });
      setItems((prev) => [saved as StyleItem, ...prev]);
      setForm({ ...form, name: "", color: "" });
      toast.success("Peça adicionada");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
  }

  async function remove(id: string) {
    await del({ data: { id } });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const shown = filter ? items.filter((i) => i.category === filter) : items;
  const byCat = CATS.map((c) => ({ c, n: items.filter((i) => i.category === c).length }));

  return (
    <AppShell appSlug="styleia">
      <ScreenHeader title="Armário digital" subtitle={`${items.length} peças cadastradas.`} />

      <form onSubmit={submit} className="surface mb-6 p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="Nome (ex: camisa branca)" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field sm:col-span-2" />
          <input placeholder="Cor" value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })} className="input-field" />
        </div>
        <button className="btn-primary mt-3"><Plus size={14} /> Adicionar peça</button>
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        <button className="chip" onClick={() => setFilter(null)}
          style={{ background: !filter ? "var(--c-orange)" : "var(--n-100)", color: !filter ? "#fff" : "var(--n-700)" }}>
          Todas ({items.length})
        </button>
        {byCat.filter(x => x.n > 0).map(({ c, n }) => (
          <button key={c} className="chip" onClick={() => setFilter(c)}
            style={{ background: filter === c ? "var(--c-orange)" : "var(--n-100)", color: filter === c ? "#fff" : "var(--n-700)" }}>
            {c} ({n})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="surface p-8 text-center text-sm" style={{ color: "var(--n-500)" }}>
          {items.length === 0 ? "Comece cadastrando suas peças favoritas." : "Nenhuma peça nessa categoria."}
        </div>
      ) : (
        <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((it) => (
            <div key={it.id} className="surface p-3">
              <div className="text-xs uppercase" style={{ color: "var(--n-500)" }}>{it.category}</div>
              <div className="font-medium">{it.name}</div>
              {it.color && <div className="text-xs" style={{ color: "var(--n-500)" }}>{it.color}</div>}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px]" style={{ color: "var(--n-500)" }}>
                  Usada {it.times_worn}x
                </span>
                <button onClick={() => remove(it.id)} className="text-xs" style={{ color: "var(--n-500)" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
