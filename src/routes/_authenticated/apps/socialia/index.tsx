import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { Sparkles, PenLine, CalendarDays, Hash, LineChart, ArrowRight, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  dailyIdea, getSocialStats, listRecentContents,
  type PostIdea,
} from "@/lib/social.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/socialia/")({
  component: SocialHome,
});

const quick = [
  { to: "/apps/socialia/gerador" as const, icon: PenLine, title: "Gerar Legenda", desc: "Copy pronto pra postar" },
  { to: "/apps/socialia/calendario" as const, icon: CalendarDays, title: "Calendário", desc: "Planeje 1 semana ou mês" },
  { to: "/apps/socialia/hashtags" as const, icon: Hash, title: "Hashtags", desc: "Popular + específicas" },
  { to: "/apps/socialia/analise" as const, icon: LineChart, title: "Analisar Perfil", desc: "Diagnóstico + ações" },
];

function SocialHome() {
  const [niche, setNiche] = useState("");
  const [stats, setStats] = useState({ captions: 0, ideas: 0, scripts: 0, analyses: 0, calendars: 0 });
  const [idea, setIdea] = useState<PostIdea | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<{ id: string; kind: string; title: string | null; created_at: string }[]>([]);

  const fetchStats = useServerFn(getSocialStats);
  const fetchRecent = useServerFn(listRecentContents);
  const fetchIdea = useServerFn(dailyIdea);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: p } = await supabase.from("profiles")
        .select("display_name").eq("id", u.user!.id).maybeSingle();
      // niche fallback
      const savedNiche = localStorage.getItem("socialia:niche") ?? "";
      setNiche(savedNiche || (p?.display_name ? `Negócio de ${p.display_name}` : "Pequeno negócio"));
      const [s, r] = await Promise.all([fetchStats(), fetchRecent()]);
      setStats(s);
      setRecent(r.slice(0, 5));
    })();
  }, [fetchStats, fetchRecent]);

  async function generateIdea() {
    if (!niche.trim()) return toast.error("Informe seu nicho.");
    localStorage.setItem("socialia:niche", niche);
    setLoading(true);
    try {
      const res = await fetchIdea({ data: { niche } });
      setIdea(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="socialia">
      <ScreenHeader title="SocialIA" subtitle="Seu social media com IA. Legenda, calendário e ideias em segundos." />

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Legendas" value={stats.captions} />
        <Stat label="Ideias" value={stats.ideas} />
        <Stat label="Roteiros" value={stats.scripts} />
        <Stat label="Calendários" value={stats.calendars} />
      </section>

      <section className="stagger mb-8 grid grid-cols-2 gap-3">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="tile-hero group">
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

      <section className="mb-8 fade-up">
        <div className="edition-tag mb-3">Sugestão da IA · hoje</div>
        <div className="surface p-5">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={niche} onChange={(e) => setNiche(e.target.value)}
              placeholder="Seu nicho (ex.: cafeteria em SP)"
              className="input-field flex-1"
            />
            <button onClick={generateIdea} disabled={loading} className="btn-primary">
              <Sparkles size={14} /> {loading ? "Pensando…" : "Sugerir ideia"}
            </button>
          </div>
          {idea && (
            <div className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--line-1)" }}>
              <div className="mb-1 text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>
                {idea.type}
              </div>
              <div className="font-medium">{idea.idea}</div>
              <div className="mt-2" style={{ color: "var(--n-500)" }}>
                <b>Hook:</b> {idea.hook}
              </div>
              <div style={{ color: "var(--n-500)" }}>
                <b>CTA:</b> {idea.cta}
              </div>
              <button className="chip chip-neutral mt-3"
                onClick={() => { navigator.clipboard.writeText(`${idea.hook}\n\n${idea.idea}\n\n${idea.cta}`); toast.success("Copiado"); }}>
                <Copy size={12} className="mr-1 inline" />Copiar
              </button>
            </div>
          )}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="fade-up">
          <div className="edition-tag mb-3">Recentes</div>
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="surface flex items-center justify-between p-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{r.title ?? r.kind}</div>
                  <div className="text-xs" style={{ color: "var(--n-500)" }}>
                    {labelKind(r.kind)} · {new Date(r.created_at).toLocaleDateString("pt-BR")}
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-4">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
    </div>
  );
}

function labelKind(k: string) {
  return { caption: "Legenda", idea: "Ideias", video_script: "Roteiro", analysis: "Análise" }[k as "caption"] ?? k;
}
