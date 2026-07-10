import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Refrigerator, Camera, CalendarDays, HeartPulse, Mic } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: Refrigerator, title: "Geladeira IA", desc: "Fotografa a geladeira, extrai ingredientes e gera receita em segundos." },
  { icon: Camera, title: "Foto → Receita", desc: "Envia foto de qualquer prato e recebe a receita completa com contexto cultural." },
  { icon: CalendarDays, title: "Planner semanal", desc: "Plano de 7 dias personalizado — respeita restrições, orçamento e paladar." },
  { icon: HeartPulse, title: "Nutri virtual", desc: "Análise de macros, substituições saudáveis e memória do que você comeu." },
  { icon: Mic, title: "Modo hands-free", desc: "Cozinhe seguindo instruções por voz. A IA lê os passos e cronometra pra você." },
  { icon: Sparkles, title: "Perfil de paladar", desc: "3 minutos de onboarding e cada receita passa a soar como sua." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40" style={{ background: "rgba(14,11,8,0.7)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line-1)" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            Sabor<em style={{ color: "var(--saffron)" }}>IA</em>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="btn-ghost text-sm">Entrar</Link>
            <Link to="/auth" className="btn-primary text-sm">Começar grátis <ArrowRight size={14} /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24">
        <div className="fade-up">
          <div className="chip"><Sparkles size={12} /> IA que aprende seu paladar</div>
          <h1 className="mt-6 max-w-3xl text-6xl leading-[0.95] sm:text-7xl md:text-8xl">
            O chef pessoal<br />
            que cabe <em style={{ color: "var(--saffron)" }}>no seu bolso</em>.
          </h1>
          <p className="mt-6 max-w-xl text-lg" style={{ color: "var(--cream-300)" }}>
            SaborIA transforma o que já está na sua geladeira em receitas incríveis,
            monta seu plano semanal e responde qualquer dúvida de nutrição — em português,
            no seu ritmo, do seu jeito.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" className="btn-primary">Começar grátis <ArrowRight size={16} /></Link>
            <a href="#features" className="btn-ghost">Ver como funciona</a>
          </div>
          <div className="mt-6 edition-tag">Sem cartão de crédito · Setup em 3 minutos</div>
        </div>

        {/* Hero visual */}
        <div className="relative mt-16 overflow-hidden rounded-3xl mesh-hero p-1">
          <div className="rounded-[22px] p-10" style={{ background: "linear-gradient(180deg, rgba(14,11,8,0.4), rgba(14,11,8,0.85))" }}>
            <div className="edition-tag" style={{ color: "var(--cream-200)" }}>Receita do dia · Edição 27</div>
            <h2 className="mt-2 text-5xl" style={{ color: "var(--cream-50)" }}>Risoto de abóbora com sálvia crocante</h2>
            <div className="mt-4 flex gap-4 text-sm" style={{ color: "var(--cream-300)" }}>
              <span>⏱ 35 min</span><span>·</span><span>🍽 4 porções</span><span>·</span><span>🔥 420 kcal</span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Aromatizado com laranja siciliana", "Baseado no que você tinha ontem", "Zero desperdício"].map((t) => (
                <div key={t} className="surface p-4 text-sm" style={{ color: "var(--cream-200)" }}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="edition-tag">O que tem dentro</div>
        <h2 className="mt-2 max-w-2xl text-5xl">Seis superpoderes na cozinha.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card-editorial p-6">
              <f.icon size={22} style={{ color: "var(--saffron)" }} />
              <div className="mt-4 text-xl" style={{ fontFamily: "var(--font-display)" }}>{f.title}</div>
              <p className="mt-2 text-sm" style={{ color: "var(--cream-400)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <h2 className="text-5xl">Sua próxima refeição começa aqui.</h2>
        <p className="mx-auto mt-3 max-w-lg" style={{ color: "var(--cream-300)" }}>
          Grátis pra sempre pros primeiros 5 pratos por dia. Sem senha, sem cartão.
        </p>
        <Link to="/auth" className="btn-primary mt-6">Criar minha conta <ArrowRight size={16} /></Link>
      </section>

      <footer className="border-t py-8 text-center text-xs" style={{ borderColor: "var(--line-1)", color: "var(--cream-500)" }}>
        © 2026 SaborIA · Cozinhando com inteligência
      </footer>
    </div>
  );
}
