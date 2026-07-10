import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { getFitProfile, listSessions } from "@/lib/fit.functions";
import { Dumbbell, MessageCircle, Activity, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/fitia/")({
  component: FitHome,
});

const quick = [
  { to: "/apps/fitia/treino" as const, icon: Dumbbell, title: "Treino de hoje", desc: "Gere e execute" },
  { to: "/apps/fitia/chat" as const, icon: MessageCircle, title: "Coach IA", desc: "Tire dúvidas e ajuste treinos" },
  { to: "/apps/fitia/progresso" as const, icon: Activity, title: "Progresso", desc: "Histórico e estatísticas" },
];

function FitHome() {
  const [profile, setProfile] = useState<{ goal?: string; fitness_level?: string } | null>(null);
  const [sessions, setSessions] = useState(0);
  const [streak, setStreak] = useState(0);

  const fetchP = useServerFn(getFitProfile);
  const fetchS = useServerFn(listSessions);

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([fetchP(), fetchS()]);
      setProfile(p as never);
      const rows = s as { completed_on: string }[];
      setSessions(rows.length);
      // simple streak calc
      let str = 0;
      const dates = new Set(rows.map((r) => r.completed_on));
      const d = new Date();
      for (let i = 0; i < 30; i++) {
        const key = d.toISOString().slice(0, 10);
        if (dates.has(key)) str++; else break;
        d.setDate(d.getDate() - 1);
      }
      setStreak(str);
    })();
  }, [fetchP, fetchS]);

  return (
    <AppShell appSlug="fitia">
      <ScreenHeader title="💪 FitIA" subtitle={profile?.goal ? `Objetivo: ${profile.goal}` : "Seu personal trainer pessoal com IA."} />

      <section className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Sessões" value={sessions} />
        <Stat label="Streak" value={`${streak}d`} />
        <Stat label="Nível" value={profile?.fitness_level ?? "—"} />
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
