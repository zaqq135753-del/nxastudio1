import { Link } from "@tanstack/react-router";
import { Sparkles, Lock, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getPricing } from "@/apps/pricing";

type Props = {
  slug: string;
  feature?: string;
  children: ReactNode;
};

/**
 * Envolve rotas/seções que só existem no plano Prime.
 * Se o usuário já é Prime -> renderiza children.
 * Caso contrário mostra hero de upsell (não bloqueia navegação).
 */
export function PrimeGate({ slug, feature, children }: Props) {
  const { isPrime, isLoading } = useEntitlements();
  if (isLoading) return <div className="animate-shimmer-bg h-40 rounded-3xl" />;
  if (isPrime(slug)) return <>{children}</>;

  const pricing = getPricing(slug);
  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--n-500)" }}>
        <Lock size={12} /> Recurso Prime
      </div>
      <h2 className="mt-3 text-2xl font-bold tracking-tight">
        {feature ?? pricing?.prime.name ?? "Recurso Prime"}
      </h2>
      {pricing && (
        <p className="mt-2 text-sm max-w-lg" style={{ color: "var(--muted-foreground)" }}>
          {pricing.primeCopy}
        </p>
      )}
      {pricing && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
          {pricing.prime.features.slice(0, 6).map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand-1)" }} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          to="/assinar/$slug"
          params={{ slug }}
          search={{ upsell: 1 }}
          className="press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{ background: "var(--text-1)", color: "var(--bg-1)" }}
        >
          Ativar Prime {pricing ? `— ${pricing.prime.priceLabel}` : ""}
          <ArrowUpRight size={14} />
        </Link>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Cancele quando quiser.
        </span>
      </div>
    </div>
  );
}
