import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMyEntitlements, isEntitled } from "@/lib/entitlements.functions";

export const Route = createFileRoute("/_authenticated/apps/saboria")({
  beforeLoad: async () => {
    try {
      const ents = await getMyEntitlements();
      if (!isEntitled(ents, "saboria")) {
        throw redirect({ to: "/hub", search: { upsell: "saboria" } as never });
      }
    } catch (e) {
      // if redirect already thrown, rethrow
      if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
      throw redirect({ to: "/hub" });
    }
  },
  component: () => <Outlet />,
});
