import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const VALID_SLUGS = ["saboria","socialia","petia","fluencyia","glowia","granaia","fitia","styleia","cosmosia","roteiroia"] as const;

export const claimTrial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      slug: z.enum(VALID_SLUGS),
      tier: z.enum(["base", "prime"]).optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("claim_trial", {
      _slug: data.slug,
      _tier: data.tier ?? "base",
    });
    if (error) throw error;
    return { ok: true };
  });

export type Entitlement = {
  app_slug: string;
  status: string;
  expires_at: string | null;
  tier?: "base" | "prime" | string | null;
};

export const getMyEntitlements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("app_entitlements")
      .select("app_slug, status, expires_at, tier")
      .eq("user_id", context.userId);
    if (error) throw error;
    return (data ?? []) as Entitlement[];
  });

export function findEntitlement(entitlements: Entitlement[], slug: string): Entitlement | undefined {
  return entitlements.find((x) => x.app_slug === slug);
}

export function isEntitled(entitlements: Entitlement[], slug: string): boolean {
  const e = findEntitlement(entitlements, slug);
  if (!e) return false;
  if (e.status === "canceled") return false;
  if (e.expires_at && new Date(e.expires_at) < new Date()) return false;
  return true;
}

export function isPrime(entitlements: Entitlement[], slug: string): boolean {
  const e = findEntitlement(entitlements, slug);
  if (!e || !isEntitled(entitlements, slug)) return false;
  return e.tier === "prime";
}

export type AppStatus = {
  status: "active" | "trial" | "locked" | "available";
  tier: "base" | "prime" | null;
  trialEndsAt: string | null;
};

export function getAppStatus(entitlements: Entitlement[], slug: string): AppStatus {
  const e = findEntitlement(entitlements, slug);
  if (!e) return { status: "available", tier: null, trialEndsAt: null };
  const tier = (e.tier === "prime" ? "prime" : "base") as "base" | "prime";
  if (e.status === "canceled") return { status: "locked", tier, trialEndsAt: null };
  if (e.expires_at && new Date(e.expires_at) < new Date()) {
    return { status: "locked", tier, trialEndsAt: e.expires_at };
  }
  if (e.status === "trial") return { status: "trial", tier, trialEndsAt: e.expires_at };
  return { status: "active", tier, trialEndsAt: e.expires_at };
}
