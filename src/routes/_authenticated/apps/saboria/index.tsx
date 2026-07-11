import { createFileRoute } from "@tanstack/react-router";
import { AppMissionHome } from "@/components/nxa/AppMissionHome";

export const Route = createFileRoute("/_authenticated/apps/saboria/")({
  component: () => <AppMissionHome slug="saboria" showVoice />,
});
