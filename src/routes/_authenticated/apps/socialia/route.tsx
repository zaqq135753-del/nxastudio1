import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMyEntitlements, isEntitled } from "@/lib/entitlements.functions";

export const Route = createFileRoute("/_authenticated/apps/socialia")({
  beforeLoad: async () => {
    try {
      const ents = await getMyEntitlements();
      if (!isEntitled(ents, "socialia")) {
        throw redirect({ to: "/assinar/$slug", params: { slug: "socialia" } });
      }
    } catch (e) {
      if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
      throw redirect({ to: "/assinar/$slug", params: { slug: "socialia" } });
    }
  },
  component: () => <Outlet />,
});
