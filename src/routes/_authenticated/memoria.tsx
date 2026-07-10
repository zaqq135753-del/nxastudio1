import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trash2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { listMemories, forgetMemory } from "@/lib/memory.functions";
import { APP_REGISTRY } from "@/apps/registry";

export const Route = createFileRoute("/_authenticated/memoria")({
  component: MemoryPage,
});

function MemoryPage() {
  const list = useServerFn(listMemories);
  const forget = useServerFn(forgetMemory);
  const qc = useQueryClient();

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: () => list({ data: { limit: 100 } }),
  });

  const del = useMutation({
    mutationFn: (id: string) => forget({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });

  const bySlug = Object.fromEntries(APP_REGISTRY.map((a) => [a.slug, a]));

  return (
    <AppShell title="Sua Memória IA">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start gap-4"
        >
          <div className="rounded-2xl p-3 glass-premium">
            <Brain className="h-6 w-6" style={{ color: "var(--aurora-1)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              O que a <span className="text-gradient">IA lembra</span> de você
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada app salva pequenas memórias para respostas mais precisas. Você pode apagar
              qualquer uma a qualquer momento.
            </p>
          </div>
        </motion.div>

        {isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}

        {!isLoading && memories.length === 0 && (
          <div className="rounded-2xl border p-8 text-center glass-premium">
            <Sparkles className="mx-auto mb-3 h-6 w-6" style={{ color: "var(--aurora-2)" }} />
            <p className="text-sm text-muted-foreground">
              Nenhuma memória ainda. Conforme você usa os apps, a IA começa a lembrar seus gostos,
              rotinas e preferências.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {memories.map((m) => {
              const app = bySlug[m.app_slug];
              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group flex items-start gap-3 rounded-xl border p-3 glass-premium"
                >
                  <div className="mt-0.5 rounded-lg px-2 py-1 text-[10px] font-medium uppercase tracking-wider"
                    style={{
                      background: "color-mix(in oklab, var(--aurora-1) 15%, transparent)",
                      color: "var(--aurora-1)",
                    }}
                  >
                    {app?.name ?? m.app_slug}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {m.kind}
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed">{m.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => del.mutate(m.id)}
                    aria-label="Esquecer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
