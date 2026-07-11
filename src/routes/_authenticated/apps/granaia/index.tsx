import { createFileRoute } from "@tanstack/react-router";
import { AppMissionHome } from "@/components/nxa/AppMissionHome";

export const Route = createFileRoute("/_authenticated/apps/granaia/")({
  component: () => <AppMissionHome slug="granaia" />,
});
