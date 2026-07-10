import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { listItineraries, getItinerary, deleteItinerary } from "@/lib/travel.functions";
import type { Day, BudgetBreakdown } from "@/lib/travel.functions";
import { Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/roteiroia/meus")({
  component: MeusPage,
});

type Row = {
  id: string; destination: string; start_date: string | null; travelers: number;
  budget_brl: number | null; days: Day[]; budget_breakdown: BudgetBreakdown | null;
};

function MeusPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [active, setActive] = useState<Row | null>(null);
  const list = useServerFn(listItineraries);
  const get = useServerFn(getItinerary);
  const del = useServerFn(deleteItinerary);

  useEffect(() => { list().then((r) => setRows(r as Row[])); }, [list]);

  async function open(id: string) {
    const r = await get({ data: { id } });
    setActive(r as Row);
  }

  async function remove(id: string) {
    if (!confirm("Excluir este roteiro?")) return;
    await del({ data: { id } });
    setActive(null);
    list().then((r) => setRows(r as Row[]));
    toast.success("Removido");
  }

  if (active) {
    return (
      <AppShell appSlug="roteiroia">
        <ScreenHeader title={active.destination} subtitle={`${active.days?.length ?? 0} dias · ${active.travelers} viajantes`} />
        <button onClick={() => setActive(null)} className="chip mb-4" style={{ background: "var(--n-100)", color: "var(--n-700)" }}>← Voltar</button>

        {active.budget_breakdown && (
          <div className="surface p-5 mb-4">
            <div className="edition-tag mb-2">Orçamento</div>
            <div className="text-2xl font-bold">R$ {active.budget_breakdown.total_brl.toLocaleString("pt-BR")}</div>
          </div>
        )}

        {active.days?.map((d) => (
          <div key={d.day} className="surface p-5 mb-3">
            <div className="edition-tag mb-2">Dia {d.day} · {d.theme}</div>
            {d.activities.map((a, i) => (
              <div key={i} className="mb-2 flex gap-3">
                <div className="w-14 shrink-0 text-xs font-semibold" style={{ color: "var(--c-orange)" }}>{a.time}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs" style={{ color: "var(--n-500)" }}>{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        ))}

        <button onClick={() => remove(active.id)} className="chip mt-4" style={{ background: "var(--n-100)", color: "var(--n-700)" }}>
          <Trash2 size={12} /> Excluir roteiro
        </button>
      </AppShell>
    );
  }

  return (
    <AppShell appSlug="roteiroia">
      <ScreenHeader title="Minhas viagens" subtitle="Todos os seus roteiros salvos." />

      {rows.length === 0 ? (
        <div className="surface p-8 text-center text-sm" style={{ color: "var(--n-500)" }}>
          Nenhum roteiro ainda. Comece criando um!
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <button key={r.id} onClick={() => open(r.id)} className="surface flex w-full items-center justify-between p-4 text-left">
              <div>
                <div className="font-medium">{r.destination}</div>
                <div className="text-xs" style={{ color: "var(--n-500)" }}>
                  {r.days?.length ?? 0} dias · {r.travelers} viajantes
                  {r.start_date ? ` · ${new Date(r.start_date).toLocaleDateString("pt-BR")}` : ""}
                </div>
              </div>
              <ChevronRight size={16} style={{ color: "var(--n-500)" }} />
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}
