import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyEntitlements, getAppStatus, isPrime, isEntitled, type Entitlement, type AppStatus } from "@/lib/entitlements.functions";

export function useEntitlements() {
  const fetchEntitlements = useServerFn(getMyEntitlements);
  const q = useQuery({
    queryKey: ["entitlements"],
    queryFn: async () => (await fetchEntitlements()) as Entitlement[],
    staleTime: 30_000,
  });
  const entitlements = q.data ?? [];
  return {
    entitlements,
    isLoading: q.isLoading,
    refetch: q.refetch,
    isEntitled: (slug: string) => isEntitled(entitlements, slug),
    isPrime: (slug: string) => isPrime(entitlements, slug),
    status: (slug: string): AppStatus => getAppStatus(entitlements, slug),
  };
}
