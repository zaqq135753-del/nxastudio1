import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { getMyPlan, type PlanStatus } from "@/lib/paywall.functions";
import { Sparkles, ArrowRight } from "lucide-react";

export function PaywallBanner() {
  const [plan, setPlan] = useState<PlanStatus | null>(null);
  const load = useServerFn(getMyPlan);
  useEffect(() => { load().then(setPlan).catch(() => {}); }, [load]);

  if (!plan || plan.plan === "pro_all" || plan.plan === "pro_3") return null;

  const urgent = plan.days_left <= 2;
  return (
    <Link
      to="/planos"
      className={`group flex items-center justify-between rounded-3xl border p-5 transition-all hover:scale-[1.01] ${
        urgent ? "border-orange-500/40 bg-orange-500/5" : "border-primary/30 bg-primary/5"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-primary/10 p-3">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-semibold">
            {plan.days_left > 0 ? `${plan.days_left} dias de trial restantes` : "Seu trial terminou"}
          </div>
          <div className="text-sm text-muted-foreground">
            Escolha um plano para manter todos os apps ativos.
          </div>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
