import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMyEntitlements, isEntitled } from "@/lib/entitlements.functions";

export const Route = createFileRoute("/_authenticated/apps/studyia")({
  beforeLoad: async () => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("nxa_vip_unlocked") === "true") {
        return;
      }
      const ents = await getMyEntitlements();
      if (!isEntitled(ents, "studyia")) {
        throw redirect({ to: "/assinar/$slug", params: { slug: "studyia" } });
      }
    } catch (e) {
      if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
      throw redirect({ to: "/assinar/$slug", params: { slug: "studyia" } });
    }
  },
  component: () => <Outlet />,
});
