import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/nxa/CommandPalette";
import { FocusMode, FocusFAB } from "@/components/nxa/FocusMode";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="edition-tag mb-2">Erro 404</div>
        <h1 className="text-6xl font-semibold">Página não encontrada</h1>
        <p className="mt-3 text-sm" style={{ color: "var(--cream-400)" }}>
          Essa receita ainda não foi escrita.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="edition-tag mb-2">Algo deu errado</div>
        <h1 className="text-3xl font-semibold">Essa página não carregou</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--cream-400)" }}>
          Tente novamente ou volte pra tela inicial.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-primary">Tentar de novo</button>
          <a href="/" className="btn-ghost">Voltar ao início</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
      { title: "NXA Studio — Uma conta, vários apps de IA" },
      {
        name: "description",
        content:
          "Uma assinatura para vários apps de IA: NXA Chef, NXA Fit e mais. Preço único por app, uma conta só.",
      },
      { name: "theme-color", content: "#0b0b0c" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "NXA" },
      { name: "application-name", content: "NXA" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { property: "og:title", content: "NXA Studio — Uma conta, vários apps de IA" },
      { property: "og:description", content: "Uma assinatura para vários apps de IA: NXA Chef, NXA Fit e mais. Preço único por app, uma conta só." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NXA Studio — Uma conta, vários apps de IA" },
      { name: "twitter:description", content: "Uma assinatura para vários apps de IA: NXA Chef, NXA Fit e mais. Preço único por app, uma conta só." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f3d6b238-3de8-4725-8c4f-3ba74bbf003c/id-preview-475e4f1e--1c6de223-05b4-477d-a9de-0e749dcabd37.lovable.app-1783885684060.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f3d6b238-3de8-4725-8c4f-3ba74bbf003c/id-preview-475e4f1e--1c6de223-05b4-477d-a9de-0e749dcabd37.lovable.app-1783885684060.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "1024x1024" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    import("@/lib/feedback").then((m) => m.installRipple()).catch(() => {});
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <PageTransitions />
      <CommandPalette />
      <FocusMode />
      <FocusFAB />
      <Toaster theme="light" position="top-center" richColors />
    </QueryClientProvider>
  );
}

function PageTransitions() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
