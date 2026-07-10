import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMyEntitlements, isEntitled } from "@/lib/entitlements.functions";

export const Route = createFileRoute("/_authenticated/apps/cosmosia")({
  beforeLoad: async () => {
    try {
      const ents = await getMyEntitlements();
      if (!isEntitled(ents, "cosmosia")) throw redirect({ to: "/hub" });
    } catch (e) {
      if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
      throw redirect({ to: "/hub" });
    }
  },
  component: () => <Outlet />,
});
