import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Entitlement = {
  app_slug: string;
  status: string;
  expires_at: string | null;
};

export const getMyEntitlements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("app_entitlements")
      .select("app_slug, status, expires_at")
      .eq("user_id", context.userId);
    if (error) throw error;
    return (data ?? []) as Entitlement[];
  });

export function isEntitled(entitlements: Entitlement[], slug: string): boolean {
  const e = entitlements.find((x) => x.app_slug === slug);
  if (!e) return false;
  if (e.status === "canceled") return false;
  if (e.expires_at && new Date(e.expires_at) < new Date()) return false;
  return true;
}
