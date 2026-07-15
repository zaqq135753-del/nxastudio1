import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Sparkles, ArrowRight, Check, ArrowLeft } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { claimTrial } from "@/lib/entitlements.functions";
import { findApp } from "@/apps/registry";
import { getLanding } from "@/apps/landings";
import { getPricing } from "@/apps/pricing";
import { PricingCard } from "@/components/commerce/PricingCard";
import { FeatureComparison } from "@/components/commerce/FeatureComparison";
import { UpsellModal } from "@/components/commerce/UpsellModal";
import { TrialBanner } from "@/components/commerce/TrialBanner";
import { getPricingOverrides } from "@/lib/settings.functions";

const INTENT_KEY = "nxa_intent_app";

export const Route = createFileRoute("/assinar/$slug")({
  ssr: false,
  head: ({ params }) => {
    const app = findApp(params.slug);
    return {
      meta: [
        { title: app ? `Assinar ${app.name} — NXA Studio` : "Assinar — NXA Studio" },
        { name: "description", content: app?.description ?? "Assine um app NXA." },
        { name: "robots", content: "index, follow" },
      ],
    };
  },
  loader: ({ params }) => {
    const app = findApp(params.slug);
    if (!app) throw notFound();
    return { app };
  },
  component: SubscribePage,
});

function SubscribePage() {
  const { app } = Route.useLoaderData();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const claim = useServerFn(claimTrial);
  const loadOverrides = useServerFn(getPricingOverrides);
  const [checkoutBase, setCheckoutBase] = useState<string | null>(null);
  const [checkoutPrime, setCheckoutPrime] = useState<string | null>(null);
  const landing = getLanding(app.slug, app);
  const pricing = getPricing(app.slug);

  async function afterAuth() {
    try { await claim({ data: { slug: app.slug as never, tier: "base" } }); } catch { /* noop */ }
    localStorage.removeItem(INTENT_KEY);
    setUpsellOpen(true); // oferece Prime antes de redirecionar
  }

  async function addPrime() {
    setClaimBusy(true);
    try { await claim({ data: { slug: app.slug as never, tier: "prime" } }); } catch { /* noop */ }
    setClaimBusy(false);
    window.location.href = app.route;
  }

  function skipPrime() {
    window.location.href = app.route;
  }

  useEffect(() => {
    localStorage.setItem(INTENT_KEY, app.slug);
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (ref) localStorage.setItem("nxa_ref", ref.toUpperCase());
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) afterAuth();
    });
    loadOverrides().then((list) => {
      const o = list.find((x) => x.app_slug === app.slug);
      setCheckoutBase(o?.checkout_url_base ?? null);
      setCheckoutPrime(o?.checkout_url_prime ?? null);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.slug]);

  function goCheckout(tier: "base" | "prime") {
    const url = tier === "prime" ? checkoutPrime : checkoutBase;
    if (url) {
      window.location.href = url;
      return true;
    }
    return false;
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/assinar/${app.slug}` },
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setSent(true);
  }

  async function signInGoogle() {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/assinar/${app.slug}`,
    });
    if (result.error) {
      setGoogleLoading(false);
      return toast.error("Não foi possível entrar com Google.");
    }
    if (result.redirected) return;
    await afterAuth();
  }

  return (
    <>
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: editorial hero per app */}
      <div className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 mesh-hero" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="flex items-center justify-between">
            <div className="edition-tag" style={{ color: "var(--cream-200)" }}>
              {landing.edition}
            </div>
            <Link to="/" className="edition-tag inline-flex items-center gap-1" style={{ color: "var(--cream-200)" }}>
              <ArrowLeft size={12} /> Todos os apps
            </Link>
          </div>
          <div>
            <div className="text-8xl leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--cream-50)" }}>
              {landing.titleLead}<br />é <em style={{ color: "var(--saffron)" }}>{landing.titleAccent}</em>{landing.titleTail}
            </div>
            <p className="mt-6 max-w-md text-lg" style={{ color: "var(--cream-200)" }}>
              {landing.subtitle}
            </p>
            <div className="mt-8 space-y-2 text-sm" style={{ color: "var(--cream-200)" }}>
              {landing.bullets.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check size={16} style={{ color: "var(--saffron)" }} /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="edition-tag">{landing.footerTag}</div>
        </div>
      </div>

      {/* Right: auth card */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm fade-up">
          <div className="chip mb-6"><Sparkles size={12} /> Assinando {app.name}</div>
          <h1 className="text-4xl">Entrar no {app.name}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--cream-400)" }}>
            {app.tagline}. Enviamos um link mágico pro seu e-mail — depois você cai direto no app.
          </p>

          <button onClick={signInGoogle} disabled={googleLoading} className="btn-ghost mt-8 w-full">
            <GoogleGlyph /> {googleLoading ? "Abrindo Google…" : "Continuar com Google"}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs" style={{ color: "var(--cream-500)" }}>
            <div className="h-px flex-1" style={{ background: "var(--line-1)" }} />
            OU COM E-MAIL
            <div className="h-px flex-1" style={{ background: "var(--line-1)" }} />
          </div>

          {sent ? (
            <div className="surface p-6 text-center fade-in">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--brand-glow)" }}>
                <Mail style={{ color: "var(--saffron)" }} />
              </div>
              <div className="font-medium">Confira seu e-mail</div>
              <p className="mt-1 text-sm" style={{ color: "var(--cream-400)" }}>
                Enviamos um link pra <b>{email}</b>. Ele abre o {app.name} direto.
              </p>
              <button className="btn-ghost mt-4" onClick={() => setSent(false)}>Usar outro e-mail</button>
            </div>
          ) : (
            <form id="assinar-form" onSubmit={sendMagicLink} className="space-y-3">
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                autoFocus
              />
              <button type="submit" disabled={sending} className="btn-primary w-full">
                {sending ? "Enviando…" : (<>Começar 7 dias grátis <ArrowRight size={16} /></>)}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-[11px]" style={{ color: "var(--cream-500)" }}>
            7 dias grátis, depois R$ 29/mês. Cancele quando quiser.
          </p>
          <p className="mt-2 text-center text-[11px]" style={{ color: "var(--cream-500)" }}>
            Ao continuar, você concorda com os Termos e a Política de Privacidade.
          </p>
          <div className="mt-6 text-center">
            <button onClick={() => navigate({ to: "/" })} className="text-xs underline underline-offset-4" style={{ color: "var(--cream-500)" }}>
              ← Ver outros apps
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Pricing Base + Prime */}
    {pricing && (
      <section className="border-t border-white/5 bg-neutral-950 px-6 py-16 text-white sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="text-xs uppercase tracking-[0.16em] text-white/50">Como funciona</div>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
              Escolha seu {pricing.base.name}. Adicione Prime quando quiser mais.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/60">
              Você começa com 7 dias grátis do plano principal. O Prime é opcional e pode ser adicionado a qualquer momento.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <PricingCard
              plan={pricing.base}
              variant="base"
              ctaLabel={checkoutBase ? "Assinar Base" : "Começar teste grátis"}
              onCta={() => { if (!goCheckout("base")) document.getElementById("assinar-form")?.scrollIntoView({ behavior: "smooth" }); }}
            />
            <PricingCard
              plan={pricing.prime}
              variant="prime"
              ctaLabel="Assinar com Prime"
              onCta={() => { if (!goCheckout("prime")) document.getElementById("assinar-form")?.scrollIntoView({ behavior: "smooth" }); }}
            />
          </div>

          <div className="mt-10">
            <div className="mb-3 text-xs uppercase tracking-[0.16em] text-white/50">Comparativo</div>
            <FeatureComparison pricing={pricing} />
          </div>

          <div className="mt-10">
            <TrialBanner slug={app.slug} />
          </div>
        </div>
      </section>
    )}

    <UpsellModal
      slug={app.slug}
      open={upsellOpen}
      onOpenChange={setUpsellOpen}
      onConfirm={addPrime}
      onSkip={skipPrime}
      busy={claimBusy}
    />
    </>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.6 19 12.5 24 12.5c3 0 5.7 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.1 4.5 9.3 9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.1-5.2c-2 1.4-4.5 2.3-7.2 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.2 39 16 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.1 5.2C41.4 35.3 43.5 30 43.5 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
  );
}
