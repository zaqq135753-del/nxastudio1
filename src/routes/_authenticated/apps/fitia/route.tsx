import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/apps/fitia")({
  component: () => <Outlet />,
});
