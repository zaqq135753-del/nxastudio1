import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Sparkles, Lock } from "lucide-react";
import { findApp } from "@/apps/registry";
import { getLanding } from "@/apps/landings";
import { getPricing } from "@/apps/pricing";
import { getAppConfig } from "@/apps/config";
import { PricingCard } from "@/components/commerce/PricingCard";
import { FeatureComparison } from "@/components/commerce/FeatureComparison";

export const Route = createFileRoute("/app/$slug")({
  head: ({ params }) => {
    const app = findApp(params.slug);
    const title = app ? `${app.name} — ${app.tagline}` : "App — NXA Studio";
    const desc = app?.description ?? "Um app da suíte NXA.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "index, follow" },
      ],
    };
  },
  loader: ({ params }) => {
    const app = findApp(params.slug);
    if (!app) throw notFound();
    return { app };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">App não encontrado</h1>
      <Link to="/" className="mt-4 inline-block underline">Voltar</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="mt-2 text-sm opacity-70">{error.message}</p>
      <Link to="/" className="mt-4 inline-block underline">Voltar</Link>
    </div>
  ),
  component: AppLandingPage,
});

function AppLandingPage() {
  const { app } = Route.useLoaderData();
  const landing = getLanding(app.slug, app);
  const pricing = getPricing(app.slug);
  const cfg = getAppConfig(app.slug);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Top nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft size={14} /> NXA Studio
        </Link>
        <Link
          to="/assinar/$slug"
          params={{ slug: app.slug }}
          className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-900 hover:opacity-90"
        >
          Começar 7 dias grátis
        </Link>
      </header>

      {/* Hero editorial */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-hero opacity-80" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-10 md:grid-cols-2 md:pt-16">
          <div>
            <div className="edition-tag" style={{ color: "var(--cream-200)" }}>
              {landing.edition}
            </div>
            <h1
              className="mt-4 text-6xl leading-[1.05] sm:text-7xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--cream-50)" }}
            >
              {landing.titleLead}{" "}
              <em style={{ color: "var(--saffron)" }}>{landing.titleAccent}</em>
              {landing.titleTail}
            </h1>
            <p className="mt-6 max-w-md text-lg" style={{ color: "var(--cream-200)" }}>
              {landing.subtitle}
            </p>
            <ul className="mt-8 space-y-2 text-sm" style={{ color: "var(--cream-200)" }}>
              {landing.bullets.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check size={16} style={{ color: "var(--saffron)" }} /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/assinar/$slug"
                params={{ slug: app.slug }}
                className="btn-primary"
              >
                Começar 7 dias grátis <ArrowRight size={16} />
              </Link>
              <a href="#planos" className="btn-ghost">Ver planos</a>
            </div>
          </div>

          {/* Pain / promise card */}
          <div className="relative">
            <div className="surface p-6 md:p-8">
              <div className="chip mb-4"><Sparkles size={12} /> A dor real</div>
              <p className="text-base leading-relaxed" style={{ color: "var(--cream-200)" }}>
                {cfg?.pain ?? app.description}
              </p>
              <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--line-1)" }}>
                <div className="edition-tag mb-3" style={{ color: "var(--cream-300)" }}>
                  O que o {app.name} faz por você
                </div>
                <p className="text-xl" style={{ fontFamily: "var(--font-display)", color: "var(--cream-50)" }}>
                  {cfg?.heroTitle ?? app.tagline}
                </p>
                <p className="mt-2 text-sm" style={{ color: "var(--cream-300)" }}>
                  {cfg?.heroSubtitle ?? app.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missions */}
      {cfg && (
        <section className="border-t border-white/5 px-6 py-16 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col items-start">
              <div className="edition-tag" style={{ color: "var(--cream-300)" }}>
                Missões
              </div>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                O que dá pra fazer hoje.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/60">
                Cada missão é uma resposta pra um momento seu — não um menu de funções.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cfg.missions.map((m) => (
                <div
                  key={m.id}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <m.icon size={18} />
                    </div>
                    {m.prime && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                        <Lock size={10} /> Prime
                      </span>
                    )}
                  </div>
                  <div className="mt-4 text-base font-medium">{m.label}</div>
                  <p className="mt-1 text-sm text-white/60">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {pricing && (
        <section id="planos" className="border-t border-white/5 bg-neutral-950 px-6 py-16 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="text-xs uppercase tracking-[0.16em] text-white/50">Planos</div>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                Comece com {pricing.base.name}. Adicione Prime quando quiser.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/60">
                7 dias grátis do plano principal. Prime é opcional e pode ser ativado a qualquer momento.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <PricingCard plan={pricing.base} variant="base" ctaLabel="Começar 7 dias grátis" />
              <PricingCard plan={pricing.prime} variant="prime" ctaLabel="Assinar com Prime" />
            </div>
            <div className="mt-10">
              <div className="mb-3 text-xs uppercase tracking-[0.16em] text-white/50">Comparativo</div>
              <FeatureComparison pricing={pricing} />
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="border-t border-white/5 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-semibold sm:text-5xl">
            Pronto pra começar com o {app.name}?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
            7 dias grátis. Cancele quando quiser. Sem cartão para começar.
          </p>
          <Link
            to="/assinar/$slug"
            params={{ slug: app.slug }}
            className="btn-primary mt-8"
          >
            Começar agora <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/40">
        © 2026 NXA Studio · <Link to="/" className="underline">Ver todos os apps</Link>
      </footer>
    </div>
  );
}
