import { createFileRoute } from "@tanstack/react-router";
import { AppMissionHome } from "@/components/nxa/AppMissionHome";

export const Route = createFileRoute("/_authenticated/apps/socialia/")({
  component: () => <AppMissionHome slug="socialia" />,
});
