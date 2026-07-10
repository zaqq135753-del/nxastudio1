import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { getSkinProfile, listAnalyses } from "@/lib/glow.functions";
import { Camera, ListChecks, ClipboardList, ArrowRight, Sun } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/glowia/")({
  component: GlowHome,
});

const quick = [
  { to: "/apps/glowia/hoje" as const, icon: Sun, title: "Rotina de hoje", desc: "Adaptada ao clima e à pele" },
  { to: "/apps/glowia/analise" as const, icon: Camera, title: "Análise por foto", desc: "Diagnóstico com IA" },
  { to: "/apps/glowia/rotina" as const, icon: ListChecks, title: "Rotina base", desc: "AM/PM personalizada" },
  { to: "/apps/glowia/perfil" as const, icon: ClipboardList, title: "Perfil de pele", desc: "Tipo, alergias, foco" },
];

function GlowHome() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [analyses, setAnalyses] = useState(0);
  const fetchP = useServerFn(getSkinProfile);
  const fetchA = useServerFn(listAnalyses);

  useEffect(() => {
    (async () => {
      const [p, a] = await Promise.all([fetchP(), fetchA()]);
      setHasProfile(!!p);
      setAnalyses((a as unknown[]).length);
    })();
  }, [fetchP, fetchA]);

  return (
    <AppShell appSlug="glowia">
      <ScreenHeader title="✨ GlowIA" subtitle="Sua consultora de skincare com IA." />

      {hasProfile === false && (
        <div className="surface p-5 mb-6 fade-up">
          <div className="text-sm font-medium mb-2">Vamos começar?</div>
          <p className="text-sm mb-3" style={{ color: "var(--n-500)" }}>
            Preencha seu perfil de pele para recebermos recomendações precisas.
          </p>
          <Link to="/apps/glowia/perfil" className="btn-primary inline-flex">Criar perfil</Link>
        </div>
      )}

      <section className="mb-6 grid grid-cols-2 gap-3">
        <Stat label="Análises feitas" value={analyses} />
        <Stat label="Rotina" value={hasProfile ? "Personalizada" : "—"} />
      </section>

      <section className="stagger grid grid-cols-1 gap-3 sm:grid-cols-3">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="tile-hero">
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface p-4">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
    </div>
  );
}
