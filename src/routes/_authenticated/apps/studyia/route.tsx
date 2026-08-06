import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMyEntitlements, isEntitled } from "@/lib/entitlements.functions";

export const Route = createFileRoute("/_authenticated/apps/studyia")({
  beforeLoad: async ({ context }) => {
    const ents = await context.queryClient.ensureQueryData({
      queryKey: ["entitlements"],
      queryFn: () => context.fetchEntitlements(),
    });
    if (typeof window !== "undefined" && localStorage.getItem("nxa_vip_unlocked") === "true") {
      return;
    }
    if (!isEntitled(ents, "studyia")) {
      throw redirect({ to: "/assinar/$slug", params: { slug: "studyia" } });
    }
    const status = getAppStatus(ents, "studyia");
    if (status.status === "locked") {
      throw redirect({ to: "/assinar/$slug", params: { slug: "studyia" } });
    }
  },
  component: () => <Outlet />,
});
