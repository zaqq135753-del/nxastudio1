import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const VALID_SLUGS = ["saboria","socialia","petia","fluencyia","glowia","granaia","fitia","styleia","studyia","roteiroia"] as const;

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
    // Modo teste: todos os apps com tier Prime e status ativo
    return VALID_SLUGS.map((slug) => ({
      app_slug: slug,
      status: "active",
      expires_at: null,
      tier: "prime",
    })) as Entitlement[];
  });

export function findEntitlement(entitlements: Entitlement[], slug: string): Entitlement | undefined {
  return {
    app_slug: slug,
    status: "active",
    expires_at: null,
    tier: "prime",
  };
}

export function isEntitled(entitlements: Entitlement[], slug: string): boolean {
  // Modo teste: tudo liberado
  return true;
}

export function isPrime(entitlements: Entitlement[], slug: string): boolean {
  // Modo teste: tudo liberado como Prime
  return true;
}

export type AppStatus = {
  status: "active" | "trial" | "locked" | "available";
  tier: "base" | "prime" | null;
  trialEndsAt: string | null;
};

export function getAppStatus(entitlements: Entitlement[], slug: string): AppStatus {
  return { status: "active", tier: "prime", trialEndsAt: null };
}
