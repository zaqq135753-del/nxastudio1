import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { listGoals, upsertGoal, deleteGoal } from "@/lib/grana.functions";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/granaia/metas")({
  component: MetasPage,
});

type Goal = { id: string; title: string; target_amount: number; saved_amount: number; deadline: string | null };

function fmt(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

function MetasPage() {
  const [items, setItems] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");

  const list = useServerFn(listGoals);
  const save = useServerFn(upsertGoal);
  const del = useServerFn(deleteGoal);

  async function reload() { setItems(await list() as unknown as Goal[]); }
  useEffect(() => { reload(); }, []);

  async function submit() {
    if (!title.trim() || !target) return toast.error("Preencha título e valor alvo");
    try {
      await save({ data: {
        title, target_amount: Number(target), saved_amount: Number(saved) || 0,
        deadline: deadline || undefined,
      }});
      setTitle(""); setTarget(""); setSaved(""); setDeadline("");
      await reload();
      toast.success("Meta criada");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
  }

  async function updateSaved(g: Goal, delta: number) {
    const newSaved = Math.max(0, Number(g.saved_amount) + delta);
    await save({ data: { id: g.id, title: g.title, target_amount: Number(g.target_amount), saved_amount: newSaved, deadline: g.deadline ?? undefined } });
    await reload();
  }

  async function remove(id: string) { await del({ data: { id } }); await reload(); }

  return (
    <AppShell appSlug="granaia">
      <ScreenHeader title="Metas" subtitle="Defina objetivos e acompanhe seu progresso." />

      <div className="surface p-5 mb-6 space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Reserva de emergência" className="input-field w-full" />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)}
            placeholder="Valor alvo (R$)" className="input-field" />
          <input type="number" value={saved} onChange={(e) => setSaved(e.target.value)}
            placeholder="Já guardado" className="input-field" />
        </div>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
          className="input-field w-full" />
        <button onClick={submit} className="btn-primary w-full"><Plus size={14} /> Criar meta</button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="surface p-5 text-center text-sm" style={{ color: "var(--n-500)" }}>Nenhuma meta ainda.</div>
        )}
        {items.map((g) => {
          const pct = Math.min(100, (Number(g.saved_amount) / Number(g.target_amount)) * 100);
          return (
            <div key={g.id} className="surface p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">{g.title}</div>
                  <div className="text-xs" style={{ color: "var(--n-500)" }}>
                    {fmt(Number(g.saved_amount))} de {fmt(Number(g.target_amount))}
                    {g.deadline && ` · até ${new Date(g.deadline).toLocaleDateString("pt-BR")}`}
                  </div>
                </div>
                <button onClick={() => remove(g.id)} className="opacity-40 hover:opacity-100"><Trash2 size={14} /></button>
              </div>
              <div className="h-2 rounded-full mb-3" style={{ background: "var(--n-100)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--c-orange)" }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateSaved(g, 50)} className="chip chip-neutral">+R$ 50</button>
                <button onClick={() => updateSaved(g, 100)} className="chip chip-neutral">+R$ 100</button>
                <button onClick={() => updateSaved(g, -50)} className="chip chip-neutral">-R$ 50</button>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
