import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import coverImg from "@/assets/cover-styleia.jpg";
import type { CSSProperties } from "react";
import { styleStats, generateLook, type Look } from "@/lib/style.functions";
import { Palette, ShoppingBag, Sparkles, User, ArrowRight, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/styleia/")({
  component: StyleHome,
});

const quick = [
  { to: "/apps/styleia/armario" as const, icon: ShoppingBag, title: "Armário digital", desc: "Cadastre peças e organize" },
  { to: "/apps/styleia/look" as const, icon: Palette, title: "Look do dia", desc: "IA monta com o que tem" },
  { to: "/apps/styleia/shopper" as const, icon: Sparkles, title: "Personal shopper", desc: "5 peças-chave pra investir" },
  { to: "/apps/styleia/perfil" as const, icon: User, title: "Perfil de estilo", desc: "Corpo, cores, preferências" },
];

const OCCASIONS = ["Trabalho", "Casual", "Balada", "Encontro", "Academia", "Formal"];

function StyleHome() {
  const [stats, setStats] = useState({ items: 0, looks: 0, unused: 0 });
  const [occasion, setOccasion] = useState("Trabalho");
  const [look, setLook] = useState<Look | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchStats = useServerFn(styleStats);
  const fetchLook = useServerFn(generateLook);

  useEffect(() => { fetchStats().then(setStats); }, [fetchStats]);

  async function generate() {
    setLoading(true);
    try { setLook(await fetchLook({ data: { occasion } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="styleia">
      <ScreenHeader title="👗 NXA Style" subtitle="Sua consultora de estilo pessoal com IA." />

      <section className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Peças" value={stats.items} />
        <Stat label="Looks" value={stats.looks} />
        <Stat label="Nunca usadas" value={stats.unused} highlight={stats.unused > 0} />
      </section>

      <section className="mb-6 fade-up">
        <div className="edition-tag mb-3">✨ Look do dia</div>
        <div className="surface p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button key={o} onClick={() => setOccasion(o)}
                className="chip"
                style={{
                  background: occasion === o ? "var(--c-orange)" : "var(--n-100)",
                  color: occasion === o ? "#fff" : "var(--n-700)",
                }}>{o}</button>
            ))}
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary w-full sm:w-auto">
            <Wand2 size={14} /> {loading ? "Montando…" : look ? "Gerar outro look" : "Gerar meu look"}
          </button>

          {look && (
            <div className="mt-5 space-y-4">
              <div>
                <div className="text-lg font-semibold tracking-tight">{look.name}</div>
                <div className="text-sm" style={{ color: "var(--n-500)" }}>{look.description}</div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {look.pieces.map((p, i) => (
                  <div key={i} className="rounded-xl border p-3 text-sm" style={{ borderColor: "var(--line-1)" }}>
                    <div className="text-xs uppercase" style={{ color: "var(--n-500)" }}>{p.category}</div>
                    <div className="font-medium">{p.description}</div>
                    <div className="text-xs" style={{ color: "var(--n-500)" }}>{p.color}</div>
                  </div>
                ))}
              </div>
              {look.tips?.length > 0 && (
                <div className="rounded-xl p-3 text-sm" style={{ background: "var(--n-100)" }}>
                  <div className="mb-1 text-xs font-semibold uppercase" style={{ color: "var(--n-500)" }}>Dicas</div>
                  <ul className="space-y-1">{look.tips.map((t, i) => <li key={i}>• {t}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="tile-hero tile-cover" style={{ ["--tile-img" as string]: `url(${coverImg})` } as CSSProperties}>
            <div className="flex items-start justify-between">
              <div className="tile-icon-wrap"><q.icon size={20} /></div>
              <ArrowRight size={14} className="tile-arrow" />
            </div>
            <div className="mt-2">
              <div className="tile-title">{q.title}</div>
              <div className="tile-desc">{q.desc}</div>
            </div>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="surface p-4">
      <div className="text-2xl font-bold tracking-tight" style={{ color: highlight ? "var(--c-orange)" : undefined }}>{value}</div>
      <div className="text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
    </div>
  );
}
