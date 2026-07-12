import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles, Lock } from "lucide-react";
import { APPS, SUITE } from "@/apps/registry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SUITE.name} — ${SUITE.tagline}` },
      { name: "description", content: "Uma assinatura para vários apps de IA: NXA Chef, NXA Fit e mais. Preço único por app, uma conta só." },
      { property: "og:title", content: `${SUITE.name} — ${SUITE.tagline}` },
      { property: "og:description", content: "Uma assinatura para vários apps de IA: NXA Chef, NXA Fit e mais. Preço único por app, uma conta só." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass" style={{ borderBottom: "1px solid var(--line-1)" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <SUITE.icon size={20} /> {SUITE.name}
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="btn-ghost text-sm">Entrar</Link>
            <Link to="/auth" className="btn-primary text-sm">Começar <ArrowRight size={14} /></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <div className="fade-up max-w-3xl">
          <div className="chip"><Sparkles size={12} /> {APPS.filter(a => a.status === "live").length} app{APPS.filter(a=>a.status==="live").length>1?"s":""} disponível{APPS.filter(a=>a.status==="live").length>1?"eis":""} · mais chegando</div>
          <h1 className="mt-6 text-[44px] leading-[1.02] font-bold tracking-tight sm:text-7xl">
            Uma conta.<br />Vários apps de IA.
          </h1>
          <p className="mt-6 max-w-xl text-lg" style={{ color: "var(--n-500)" }}>
            {SUITE.name} é uma suíte de aplicativos feitos com IA — cada um resolve
            uma parte da sua rotina. Assine só o que usar, tudo com o mesmo login.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/auth" className="btn-primary">Criar conta grátis <ArrowRight size={16} /></Link>
            <a href="#apps" className="btn-ghost">Ver os apps</a>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ color: "var(--n-500)" }}>
            <span className="inline-flex items-center gap-1.5"><Check size={14} /> {SUITE.pricePerApp} por app</span>
            <span className="inline-flex items-center gap-1.5"><Check size={14} /> Um login pra tudo</span>
            <span className="inline-flex items-center gap-1.5"><Check size={14} /> Cancele quando quiser</span>
          </div>
        </div>
      </section>

      <section id="apps" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="edition-tag mb-3">Os apps</div>
        <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Escolha um. Ou todos.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((a) => {
            const soon = a.status === "soon";
            return (
              <div key={a.slug} className="tile-hero relative flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="tile-icon-wrap"><a.icon size={22} /></div>
                  {soon ? (
                    <span className="chip chip-neutral text-[10px]"><Lock size={10} className="mr-1 inline" />Em breve</span>
                  ) : (
                    <span className="chip chip-neutral text-[10px]">Disponível</span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="tile-title text-lg">{a.name}</div>
                  <div className="tile-desc mt-1">{a.tagline}</div>
                  <p className="mt-3 text-sm" style={{ color: "var(--n-500)" }}>{a.description}</p>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span style={{ color: "var(--n-500)" }}>{SUITE.pricePerApp}</span>
                  {soon ? (
                    <span className="text-xs" style={{ color: "var(--n-500)" }}>Avisamos você</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link to="/app/$slug" params={{ slug: a.slug }} className="text-xs underline underline-offset-4" style={{ color: "var(--n-500)" }}>
                        Saiba mais
                      </Link>
                      <Link to="/assinar/$slug" params={{ slug: a.slug }} className="font-medium underline underline-offset-4">
                        Assinar
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Sua próxima ferramenta começa aqui.</h2>
        <p className="mx-auto mt-3 max-w-lg" style={{ color: "var(--n-500)" }}>
          Uma conta. Vários apps. Preço único por app, sem pegadinha.
        </p>
        <Link to="/auth" className="btn-primary mt-6">Criar minha conta <ArrowRight size={16} /></Link>
      </section>

      <footer className="border-t py-8 text-center text-xs"
        style={{ borderColor: "var(--line-1)", color: "var(--n-500)" }}>
        © 2026 {SUITE.name} · Uma suíte de apps de IA
      </footer>
    </div>
  );
}
