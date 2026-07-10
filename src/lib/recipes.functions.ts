import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SavedRecipeInput = {
  name: string;
  emoji?: string;
  description?: string;
  time?: string;
  servings?: string;
  difficulty?: string;
  calories?: string;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
  source?: "geladeira" | "foto" | "planner" | "manual";
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "receita";
}

export const saveRecipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SavedRecipeInput) => {
    if (!data?.name) throw new Error("Nome obrigatório");
    if (!Array.isArray(data.ingredients) || !Array.isArray(data.steps)) {
      throw new Error("Ingredientes e passos obrigatórios");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const slug = `${slugify(data.name)}-${Date.now().toString(36)}`;
    const { data: row, error } = await context.supabase
      .from("saved_recipes")
      .insert({
        user_id: context.userId,
        slug,
        name: data.name,
        emoji: data.emoji ?? null,
        description: data.description ?? null,
        time: data.time ?? null,
        servings: data.servings ?? null,
        difficulty: data.difficulty ?? null,
        calories: data.calories ?? null,
        ingredients: data.ingredients,
        steps: data.steps,
        image_url: data.imageUrl ?? null,
        source: data.source ?? "manual",
        is_public: false,
        is_favorite: false,
      })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export type SavedRecipeRow = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  description: string | null;
  time: string | null;
  image_url: string | null;
  created_at: string;
  is_favorite: boolean;
};

export const listSavedRecipes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_recipes")
      .select("id, slug, name, emoji, description, time, image_url, created_at, is_favorite")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as SavedRecipeRow[];
  });

export const toggleFavoriteRecipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; value: boolean }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_recipes")
      .update({ is_favorite: data.value })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSavedRecipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_recipes")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
