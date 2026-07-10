import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMyEntitlements, isEntitled } from "@/lib/entitlements.functions";

export const Route = createFileRoute("/_authenticated/apps/fluencyia")({
  beforeLoad: async () => {
    try {
      const ents = await getMyEntitlements();
      if (!isEntitled(ents, "fluencyia")) throw redirect({ to: "/hub" });
    } catch (e) {
      if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
      throw redirect({ to: "/hub" });
    }
  },
  component: () => <Outlet />,
});
