import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { generateCalendar, listCalendars, type CalendarPost } from "@/lib/social.functions";
import { Sparkles, Download, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/socialia/calendario")({
  component: Calendario,
});

const GOALS = ["Engajamento", "Venda", "Educação", "Branding"];

function Calendario() {
  const [form, setForm] = useState({
    niche: "", frequency: "3x/semana", duration: "1 semana", goals: ["Engajamento", "Educação"] as string[],
  });
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<{ id: string; name: string; created_at: string }[]>([]);
  const gen = useServerFn(generateCalendar);
  const list = useServerFn(listCalendars);

  useEffect(() => { list().then((rows) => setSaved(rows.map((r) => ({ id: r.id, name: r.name, created_at: r.created_at })))); }, [list]);

  function toggleGoal(g: string) {
    setForm((f) => ({ ...f, goals: f.goals.includes(g) ? f.goals.filter((x) => x !== g) : [...f.goals, g] }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.niche.trim()) return toast.error("Informe o nicho.");
    setLoading(true);
    try {
      const res = await gen({ data: form });
      setPosts(res.posts);
      toast.success("Calendário gerado e salvo");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  function exportCSV() {
    const header = "date,time,type,theme,goal,captionIdea\n";
    const rows = posts.map((p) => [p.date, p.time, p.type, esc(p.theme), esc(p.goal), esc(p.captionIdea)].join(","));
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `calendario-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <AppShell appSlug="socialia">
      <ScreenHeader title="Calendário editorial" subtitle="Diga o nicho, a frequência e a duração. A IA planeja tudo." />

      <form onSubmit={submit} className="surface space-y-3 p-5">
        <label className="block">
          <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Nicho</div>
          <input className="input-field w-full" value={form.niche}
            onChange={(e) => setForm({ ...form, niche: e.target.value })}
            placeholder="Ex.: consultoria de marketing digital" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Frequência</div>
            <select className="input-field w-full" value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              {["3x/semana", "5x/semana", "Diário"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Duração</div>
            <select className="input-field w-full" value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}>
              {["1 semana", "2 semanas", "1 mês"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        </div>
        <div>
          <div className="mb-1 text-xs" style={{ color: "var(--n-500)" }}>Objetivos</div>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button key={g} type="button" onClick={() => toggleGoal(g)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: form.goals.includes(g) ? "var(--c-orange)" : "var(--n-100)",
                  color: form.goals.includes(g) ? "#fff" : "var(--n-700)",
                }}>{g}</button>
            ))}
          </div>
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          <Sparkles size={14} /> {loading ? "Gerando…" : "Gerar calendário"}
        </button>
      </form>

      {loading && <div className="mt-4"><TypingIndicator label="Planejando os próximos dias…" /></div>}

      {posts.length > 0 && (
        <section className="fade-up mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="edition-tag">{posts.length} posts planejados</div>
            <button onClick={exportCSV} className="btn-ghost text-sm"><Download size={14} /> Exportar CSV</button>
          </div>
          <div className="space-y-2">
            {posts.map((p, i) => (
              <div key={i} className="surface p-4 text-sm">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="chip chip-neutral text-[10px]">{p.type}</span>
                    <span className="text-xs" style={{ color: "var(--n-500)" }}>
                      {formatDate(p.date)} · {p.time}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase" style={{ color: "var(--n-500)" }}>{p.goal}</span>
                </div>
                <div className="font-medium">{p.theme}</div>
                <div className="mt-1" style={{ color: "var(--n-500)" }}>{p.description}</div>
                <div className="mt-2 text-xs italic" style={{ color: "var(--n-500)" }}>
                  💡 {p.captionIdea}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {saved.length > 0 && (
        <section className="mt-8">
          <div className="edition-tag mb-3">Salvos</div>
          <div className="space-y-2">
            {saved.map((s) => (
              <div key={s.id} className="surface flex items-center gap-3 p-3 text-sm">
                <CalendarDays size={16} style={{ color: "var(--n-500)" }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.name}</div>
                  <div className="text-xs" style={{ color: "var(--n-500)" }}>
                    {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function esc(s: string) { return `"${(s ?? "").replace(/"/g, '""')}"`; }
function formatDate(d: string) {
  try { return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }); }
  catch { return d; }
}
