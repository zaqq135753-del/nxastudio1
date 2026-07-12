import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { listSavedRecipes, deleteSavedRecipe, toggleFavoriteRecipe, type SavedRecipeRow } from "@/lib/recipes.functions";
import { toast } from "sonner";
import { Heart, Trash2, Sparkles } from "lucide-react";
import { reward } from "@/lib/reward";

export const Route = createFileRoute("/_authenticated/apps/saboria/receitas")({
  component: ReceitasPage,
});

function ReceitasPage() {
  const list = useServerFn(listSavedRecipes);
  const del = useServerFn(deleteSavedRecipe);
  const fav = useServerFn(toggleFavoriteRecipe);
  const [rows, setRows] = useState<SavedRecipeRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await list();
      setRows(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta receita?")) return;
    try {
      await del({ data: { id } });
      setRows((r) => r.filter((x) => x.id !== id));
      toast.success("Receita removida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    }
  }
  async function handleFav(id: string, current: boolean) {
    try {
      await fav({ data: { id, value: !current } });
      setRows((r) => r.map((x) => x.id === id ? { ...x, is_favorite: !current } : x));
      if (!current) void reward(5, "Receita favoritada", "saboria");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    }
  }

  return (
    <AppShell>
      <ScreenHeader title="📖 Minhas Receitas" subtitle="Tudo que a IA já criou e você guardou" />
      {loading && <div className="text-sm" style={{ color: "var(--cream-400)" }}>Carregando...</div>}
      {!loading && rows.length === 0 && (
        <div className="surface p-8 text-center">
          <Sparkles size={28} className="mx-auto mb-3" style={{ color: "var(--saffron)" }} />
          <div className="text-lg" style={{ fontFamily: "var(--font-display)" }}>Nenhuma receita salva ainda</div>
          <div className="mt-1 text-sm" style={{ color: "var(--cream-400)" }}>
            Gere uma receita em Geladeira ou Foto e toque em <b>Salvar</b>.
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.id} className="surface overflow-hidden">
            {r.image_url ? (
              <img src={r.image_url} alt={r.name} className="h-44 w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-44 w-full items-center justify-center text-5xl" style={{ background: "var(--bg-2, #1a1512)" }}>
                {r.emoji ?? "🍽️"}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-lg" style={{ fontFamily: "var(--font-display)" }}>{r.name}</div>
                  {r.time && <div className="mt-1 text-xs" style={{ color: "var(--cream-400)" }}>{r.time}</div>}
                </div>
                <div className="flex gap-1">
                  <button aria-label="Favoritar" onClick={() => handleFav(r.id, r.is_favorite)} className="rounded-full p-2 hover:bg-white/5">
                    <Heart size={16} fill={r.is_favorite ? "currentColor" : "none"} style={{ color: r.is_favorite ? "var(--tomato)" : "var(--cream-400)" }} />
                  </button>
                  <button aria-label="Excluir" onClick={() => handleDelete(r.id)} className="rounded-full p-2 hover:bg-white/5">
                    <Trash2 size={16} style={{ color: "var(--cream-400)" }} />
                  </button>
                </div>
              </div>
              {r.description && (
                <p className="mt-2 text-sm line-clamp-2" style={{ color: "var(--cream-300)" }}>{r.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
