import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { dailyHoroscope, getCosmosProfile, type Horoscope } from "@/lib/cosmos.functions";
import { Stars, Sparkle, Heart, User, ArrowRight, Moon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/cosmosia/")({
  component: CosmosHome,
});

const SIGN_EMOJI: Record<string, string> = {
  aries: "♈", touro: "♉", gemeos: "♊", cancer: "♋", leao: "♌", virgem: "♍",
  libra: "♎", escorpiao: "♏", sagitario: "♐", capricornio: "♑", aquario: "♒", peixes: "♓",
};

const quick = [
  { to: "/apps/cosmosia/mapa" as const, icon: Stars, title: "Mapa astral", desc: "Sol, Lua e Ascendente" },
  { to: "/apps/cosmosia/tarot" as const, icon: Sparkle, title: "Tarot", desc: "Tire uma carta agora" },
  { to: "/apps/cosmosia/compatibilidade" as const, icon: Heart, title: "Match", desc: "Sinastria com alguém" },
  { to: "/apps/cosmosia/perfil" as const, icon: User, title: "Perfil", desc: "Data e local de nascimento" },
];

function CosmosHome() {
  const [profile, setProfile] = useState<{ sun_sign?: string; moon_sign?: string; birth_date?: string } | null>(null);
  const [horo, setHoro] = useState<Horoscope | null>(null);
  const [loading, setLoading] = useState(false);
  const getP = useServerFn(getCosmosProfile);
  const getH = useServerFn(dailyHoroscope);

  useEffect(() => {
    getP().then((p) => setProfile(p as { sun_sign?: string; moon_sign?: string; birth_date?: string } | null));
  }, [getP]);

  async function loadHoro() {
    setLoading(true);
    try { setHoro(await getH()); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader title="🔮 CosmosIA" subtitle="Seu astrólogo virtual com IA." />

      {profile?.sun_sign ? (
        <div className="surface p-5 mb-6 fade-up">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{SIGN_EMOJI[profile.sun_sign] ?? "✨"}</div>
            <div>
              <div className="text-lg font-semibold tracking-tight capitalize">{profile.sun_sign}</div>
              <div className="text-xs" style={{ color: "var(--n-500)" }}>
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                {profile.moon_sign ? ` · Lua em ${profile.moon_sign}` : ""}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="surface p-5 mb-6 fade-up">
          <div className="text-sm font-medium mb-1">Complete seu perfil</div>
          <p className="text-sm mb-3" style={{ color: "var(--n-500)" }}>
            Precisamos da sua data de nascimento para calcular seu signo e mapa.
          </p>
          <Link to="/apps/cosmosia/perfil" className="btn-primary inline-flex">Criar perfil</Link>
        </div>
      )}

      {profile?.sun_sign && (
        <section className="mb-6 fade-up">
          <div className="edition-tag mb-2">Horóscopo de hoje</div>
          <div className="surface p-5">
            {horo ? (
              <div className="space-y-4">
                <p className="text-sm">{horo.overall}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Score label="💕 Amor" text={horo.love.text} score={horo.love.score} />
                  <Score label="💼 Carreira" text={horo.career.text} score={horo.career.score} />
                  <Score label="🏥 Saúde" text={horo.health.text} score={horo.health.score} />
                  <Score label="🧘 Espírito" text={horo.spirituality.text} score={horo.spirituality.score} />
                </div>
                <div className="flex flex-wrap gap-3 pt-2 text-xs" style={{ color: "var(--n-500)" }}>
                  <span>🎯 Números: {horo.lucky_numbers.join(", ")}</span>
                  <span>🎨 Cor: {horo.lucky_color}</span>
                </div>
                <div className="rounded-xl p-3 text-sm" style={{ background: "var(--n-100)" }}>💫 {horo.advice}</div>
              </div>
            ) : (
              <div className="text-sm" style={{ color: "var(--n-500)" }}>Descubra o que os astros dizem sobre hoje.</div>
            )}
            <button onClick={loadHoro} disabled={loading} className="btn-primary mt-4">
              <Moon size={14} /> {loading ? "Consultando os astros…" : horo ? "Atualizar" : "Ler horóscopo"}
            </button>
          </div>
        </section>
      )}

      <section className="stagger grid grid-cols-2 gap-3">
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

function Score({ label, text, score }: { label: string; text: string; score: number }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--n-100)" }}>
      <div className="text-xs font-medium">{label}</div>
      <div className="text-xs mt-1" style={{ color: "var(--c-orange)" }}>{"★".repeat(score)}{"☆".repeat(5 - score)}</div>
      <div className="text-xs mt-1" style={{ color: "var(--n-500)" }}>{text}</div>
    </div>
  );
}
