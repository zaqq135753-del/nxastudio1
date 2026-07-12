import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { financialSummary } from "@/lib/grana.functions";
import { getSocialStats } from "@/lib/social.functions";
import { styleStats } from "@/lib/style.functions";
import { langStats } from "@/lib/fluency.functions";
import { listSessions } from "@/lib/fit.functions";
import { listAnalyses, listRoutines } from "@/lib/glow.functions";
import { listTarotHistory } from "@/lib/cosmos.functions";
import { listPets } from "@/lib/pet.functions";
import { listSavedRecipes } from "@/lib/recipes.functions";
import { listItineraries } from "@/lib/travel.functions";
import { SectionHeader } from "./SectionHeader";
import type { ReactNode } from "react";

type Stat = { label: string; value: string; hint?: string; tone?: "pos" | "neg" | "neutral" };

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function StatGrid({ stats, footer }: { stats: Stat[]; footer?: ReactNode }) {
  return (
    <div className="surface p-4 fade-up">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <div className="edition-tag mb-1 truncate">{s.label}</div>
            <div
              className="truncate text-[20px] font-black tracking-tight"
              style={{
                color:
                  s.tone === "pos" ? "#16a34a"
                  : s.tone === "neg" ? "#dc2626"
                  : undefined,
              }}
            >
              {s.value}
            </div>
            {s.hint && (
              <div className="mt-0.5 truncate text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {s.hint}
              </div>
            )}
          </div>
        ))}
      </div>
      {footer && <div className="mt-3 text-[12px]" style={{ color: "var(--muted-foreground)" }}>{footer}</div>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="surface p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="mb-1 h-3 w-16 animate-pulse rounded bg-black/5" />
            <div className="h-5 w-20 animate-pulse rounded bg-black/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------- Per-app summaries -------- */

function GranaSummary() {
  const fn = useServerFn(financialSummary);
  const q = useQuery({ queryKey: ["summary", "granaia"], queryFn: () => fn(), staleTime: 60_000 });
  if (q.isLoading) return <Skeleton />;
  const d = q.data;
  if (!d) return null;
  const top = Object.entries(d.byCategory ?? {}).sort((a, b) => b[1] - a[1])[0];
  return (
    <StatGrid
      stats={[
        { label: "Entradas", value: fmtBRL(d.income), tone: "pos" },
        { label: "Saídas", value: fmtBRL(d.expense), tone: "neg" },
        { label: "Saldo", value: fmtBRL(d.balance), tone: d.balance >= 0 ? "pos" : "neg" },
        { label: "Transações", value: String(d.count), hint: top ? `Top: ${top[0]}` : undefined },
      ]}
      footer={<>Este mês · <Link to="/apps/granaia/transacoes" className="underline">ver detalhes</Link></>}
    />
  );
}

function SocialSummary() {
  const fn = useServerFn(getSocialStats);
  const q = useQuery({ queryKey: ["summary", "socialia"], queryFn: () => fn(), staleTime: 60_000 });
  if (q.isLoading) return <Skeleton />;
  const d = q.data as any;
  if (!d) return null;
  return (
    <StatGrid
      stats={[
        { label: "Legendas", value: String(d.captions ?? 0) },
        { label: "Ideias", value: String(d.ideas ?? 0) },
        { label: "Roteiros", value: String(d.scripts ?? 0) },
        { label: "Calendários", value: String(d.calendarsCount ?? 0) },
      ]}
    />
  );
}

function StyleSummary() {
  const fn = useServerFn(styleStats);
  const q = useQuery({ queryKey: ["summary", "styleia"], queryFn: () => fn(), staleTime: 60_000 });
  if (q.isLoading) return <Skeleton />;
  const d = q.data;
  if (!d) return null;
  return (
    <StatGrid
      stats={[
        { label: "Peças", value: String(d.items) },
        { label: "Looks", value: String(d.looks) },
        { label: "Sem uso", value: String(d.unused), tone: d.unused > 0 ? "neg" : "neutral" },
        { label: "Aproveitadas", value: String(Math.max(0, d.items - d.unused)) },
      ]}
    />
  );
}

function LangSummary() {
  const fn = useServerFn(langStats);
  const q = useQuery({ queryKey: ["summary", "fluencyia"], queryFn: () => fn(), staleTime: 60_000 });
  if (q.isLoading) return <Skeleton />;
  const d = q.data;
  if (!d) return null;
  return (
    <StatGrid
      stats={[
        { label: "Vocabulário", value: String(d.vocab) },
        { label: "Sessões", value: String(d.sessions) },
      ]}
    />
  );
}

function FitSummary() {
  const fn = useServerFn(listSessions);
  const q = useQuery({ queryKey: ["summary", "fitia"], queryFn: () => fn(), staleTime: 60_000 });
  if (q.isLoading) return <Skeleton />;
  const rows = (q.data ?? []) as Array<{ completed_on: string }>;
  const now = Date.now();
  const week = rows.filter((r) => now - new Date(r.completed_on).getTime() < 7 * 86400000).length;
  const month = rows.filter((r) => now - new Date(r.completed_on).getTime() < 30 * 86400000).length;
  const last = rows[0]?.completed_on;
  return (
    <StatGrid
      stats={[
        { label: "Semana", value: String(week) },
        { label: "Mês", value: String(month) },
        { label: "Total", value: String(rows.length) },
        { label: "Último", value: last ? new Date(last).toLocaleDateString("pt-BR") : "—" },
      ]}
    />
  );
}

function GlowSummary() {
  const a = useServerFn(listAnalyses);
  const r = useServerFn(listRoutines);
  const qa = useQuery({ queryKey: ["summary", "glowia", "a"], queryFn: () => a(), staleTime: 60_000 });
  const qr = useQuery({ queryKey: ["summary", "glowia", "r"], queryFn: () => r(), staleTime: 60_000 });
  if (qa.isLoading || qr.isLoading) return <Skeleton />;
  const analyses = (qa.data ?? []) as Array<{ created_at: string }>;
  const routines = (qr.data ?? []) as unknown[];
  return (
    <StatGrid
      stats={[
        { label: "Análises", value: String(analyses.length) },
        { label: "Rotinas", value: String(routines.length) },
        { label: "Última análise", value: analyses[0]?.created_at ? new Date(analyses[0].created_at).toLocaleDateString("pt-BR") : "—" },
      ]}
    />
  );
}

function CosmosSummary() {
  const fn = useServerFn(listTarotHistory);
  const q = useQuery({ queryKey: ["summary", "cosmosia"], queryFn: () => fn(), staleTime: 60_000 });
  if (q.isLoading) return <Skeleton />;
  const rows = (q.data ?? []) as Array<{ created_at: string }>;
  return (
    <StatGrid
      stats={[
        { label: "Leituras", value: String(rows.length) },
        { label: "Última", value: rows[0]?.created_at ? new Date(rows[0].created_at).toLocaleDateString("pt-BR") : "—" },
      ]}
    />
  );
}

function PetSummary() {
  const fn = useServerFn(listPets);
  const q = useQuery({ queryKey: ["summary", "petia"], queryFn: () => fn(), staleTime: 60_000 });
  if (q.isLoading) return <Skeleton />;
  const rows = (q.data ?? []) as Array<{ name: string; species?: string }>;
  return (
    <StatGrid
      stats={[
        { label: "Pets", value: String(rows.length), hint: rows.map((p) => p.name).slice(0, 2).join(", ") || undefined },
      ]}
    />
  );
}

function SaborSummary() {
  const fn = useServerFn(listSavedRecipes);
  const q = useQuery({ queryKey: ["summary", "saboria"], queryFn: () => fn({ data: {} } as any), staleTime: 60_000 });
  if (q.isLoading) return <Skeleton />;
  const rows = (q.data ?? []) as Array<{ is_favorite?: boolean }>;
  const favs = rows.filter((r) => r.is_favorite).length;
  return (
    <StatGrid
      stats={[
        { label: "Receitas", value: String(rows.length) },
        { label: "Favoritas", value: String(favs) },
      ]}
    />
  );
}

function RoteiroSummary() {
  const fn = useServerFn(listItineraries);
  const q = useQuery({ queryKey: ["summary", "roteiroia"], queryFn: () => fn(), staleTime: 60_000 });
  if (q.isLoading) return <Skeleton />;
  const rows = (q.data ?? []) as unknown[];
  return (
    <StatGrid stats={[{ label: "Roteiros", value: String(rows.length) }]} />
  );
}

const REGISTRY: Record<string, () => ReactNode> = {
  granaia: GranaSummary,
  socialia: SocialSummary,
  styleia: StyleSummary,
  fluencyia: LangSummary,
  fitia: FitSummary,
  glowia: GlowSummary,
  cosmosia: CosmosSummary,
  petia: PetSummary,
  saboria: SaborSummary,
  roteiroia: RoteiroSummary,
};

/** Resumo real dos dados do usuário no app (não é IA). */
export function AppDataSummary({ slug }: { slug: string }) {
  const Cmp = REGISTRY[slug];
  if (!Cmp) return null;
  return (
    <section className="mb-6">
      <SectionHeader kicker="Panorama" title="Seus números agora" />
      <Cmp />
    </section>
  );
}
