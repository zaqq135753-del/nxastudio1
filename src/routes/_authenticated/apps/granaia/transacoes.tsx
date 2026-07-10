import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { addTransaction, listTransactions, deleteTransaction } from "@/lib/grana.functions";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/granaia/transacoes")({
  component: TxPage,
});

const CATEGORIES = ["Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Educação", "Delivery", "Outros"];

type Tx = { id: string; kind: string; category: string; amount: number; description: string | null; occurred_on: string };

function fmt(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

function TxPage() {
  const [items, setItems] = useState<Tx[]>([]);
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("Alimentação");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const add = useServerFn(addTransaction);
  const list = useServerFn(listTransactions);
  const del = useServerFn(deleteTransaction);

  async function reload() {
    const rows = await list({ data: { limit: 100 } });
    setItems(rows as unknown as Tx[]);
  }
  useEffect(() => { reload(); }, []);

  async function submit() {
    const a = Number(amount);
    if (!a || a <= 0) return toast.error("Valor inválido");
    try {
      await add({ data: { kind, category, amount: a, description: desc } });
      setAmount(""); setDesc("");
      toast.success("Registrado");
      await reload();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
  }

  async function remove(id: string) {
    await del({ data: { id } });
    await reload();
  }

  return (
    <AppShell appSlug="granaia">
      <ScreenHeader title="Transações" subtitle="Registre suas receitas e gastos." />

      <div className="surface p-5 mb-6 space-y-3">
        <div className="flex gap-2">
          <button onClick={() => setKind("expense")} className="chip flex-1"
            style={{ background: kind === "expense" ? "var(--c-orange)" : "var(--n-100)", color: kind === "expense" ? "#fff" : undefined }}>Gasto</button>
          <button onClick={() => setKind("income")} className="chip flex-1"
            style={{ background: kind === "income" ? "var(--c-orange)" : "var(--n-100)", color: kind === "income" ? "#fff" : undefined }}>Receita</button>
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-full">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00" className="input-field flex-1" />
          <input value={desc} onChange={(e) => setDesc(e.target.value)}
            placeholder="Descrição (opcional)" className="input-field flex-[2]" />
        </div>
        <button onClick={submit} className="btn-primary w-full"><Plus size={14} /> Registrar</button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <div className="surface p-5 text-center text-sm" style={{ color: "var(--n-500)" }}>
            Nenhuma transação ainda.
          </div>
        )}
        {items.map((t) => (
          <div key={t.id} className="surface flex items-center justify-between p-3 text-sm">
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{t.description || t.category}</div>
              <div className="text-xs" style={{ color: "var(--n-500)" }}>
                {t.category} · {new Date(t.occurred_on).toLocaleDateString("pt-BR")}
              </div>
            </div>
            <div className="ml-2 text-right">
              <div className="font-semibold" style={{ color: t.kind === "income" ? "#16a34a" : "#dc2626" }}>
                {t.kind === "income" ? "+" : "-"}{fmt(Number(t.amount))}
              </div>
              <button onClick={() => remove(t.id)} className="opacity-40 hover:opacity-100"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
