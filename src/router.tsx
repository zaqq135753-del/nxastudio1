import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AppLoadingScreen } from "./components/nxa/AppLoadingScreen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: AppLoadingScreen,
    defaultPendingMs: 100,
    defaultPendingMinMs: 400,
  });

  return router;
};
