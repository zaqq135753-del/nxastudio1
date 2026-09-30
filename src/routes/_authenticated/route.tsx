import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    // Modo teste: se não houver usuário logado no Supabase, usa usuário mock de teste
    const user = data?.user ?? {
      id: "zaqq135753-test-user-id",
      email: "zaqq135753@gmail.com",
      user_metadata: {
        name: "Zaqq",
        full_name: "Zaqq",
      },
    };
    return { user };
  },
  component: () => <Outlet />,
});
