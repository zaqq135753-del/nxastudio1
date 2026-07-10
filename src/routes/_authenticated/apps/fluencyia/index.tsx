import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import coverImg from "@/assets/cover-fluencyia.jpg";
import type { CSSProperties } from "react";
import { getLangProfile, langStats, LANGS } from "@/lib/fluency.functions";
import { MessageCircle, BookOpen, User, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/fluencyia/")({
  component: FluencyHome,
});

const quick = [
  { to: "/apps/fluencyia/conversar" as const, icon: MessageCircle, title: "Conversar", desc: "Prática com IA corrigindo em tempo real" },
  { to: "/apps/fluencyia/vocabulario" as const, icon: BookOpen, title: "Vocabulário", desc: "Gere e revise palavras novas" },
  { to: "/apps/fluencyia/perfil" as const, icon: User, title: "Perfil", desc: "Ajuste idioma e nível" },
];

function FluencyHome() {
  const [profile, setProfile] = useState<{ target_lang: string; level: string; daily_goal_min: number } | null>(null);
  const [stats, setStats] = useState({ vocab: 0, sessions: 0 });
  const fetchProfile = useServerFn(getLangProfile);
  const fetchStats = useServerFn(langStats);

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([fetchProfile(), fetchStats()]);
      setProfile(p as never);
      setStats(s);
    })();
  }, [fetchProfile, fetchStats]);

  const lang = LANGS[profile?.target_lang ?? "en"] ?? "Inglês";
  const level = profile?.level ?? "A1";

  return (
    <AppShell appSlug="fluencyia">
      <ScreenHeader title="NXA Lingua" subtitle={`Seu tutor de ${lang}. Nível atual: ${level}.`} />

      <section className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Palavras" value={stats.vocab} />
        <Stat label="Sessões" value={stats.sessions} />
        <Stat label="Meta/dia" value={`${profile?.daily_goal_min ?? 15}min`} />
      </section>

      <section className="mb-8 fade-up">
        <div className="edition-tag mb-3">Sugestão de hoje</div>
        <Link to="/apps/fluencyia/conversar" className="tile-hero block">
          <div className="flex items-start justify-between">
            <div className="tile-icon-wrap"><Sparkles size={20} /></div>
            <ArrowRight size={14} className="tile-arrow" />
          </div>
          <div className="mt-2">
            <div className="tile-title">Pratique conversação em {lang}</div>
            <div className="tile-desc">15 minutos · a IA escolhe o tema e corrige seus erros</div>
          </div>
        </Link>
      </section>

      <section className="stagger grid grid-cols-1 gap-3 sm:grid-cols-3">
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface p-4">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
    </div>
  );
}
