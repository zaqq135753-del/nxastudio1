import { PRICING } from "@/apps/pricing";
import type { PricingOverride } from "./settings.functions";

let applied = false;

/** Aplica os overrides do banco em cima do PRICING hardcoded, in-place. Idempotente. */
export function applyPricingOverrides(overrides: PricingOverride[]) {
  for (const o of overrides) {
    const p = PRICING[o.app_slug];
    if (!p) continue;
    if (o.base_monthly != null) p.base.monthly = o.base_monthly;
    if (o.base_price_label) p.base.priceLabel = o.base_price_label;
    if (o.base_tagline) p.base.tagline = o.base_tagline;
    if (o.prime_monthly != null) p.prime.monthly = o.prime_monthly;
    if (o.prime_price_label) p.prime.priceLabel = o.prime_price_label;
    if (o.prime_tagline) p.prime.tagline = o.prime_tagline;
  }
  applied = true;
}

export function pricingOverridesApplied() {
  return applied;
}
