import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { generateRecipe, generateRecipeImage, type FridgeRecipe } from "@/lib/ai.functions";
import { saveRecipe } from "@/lib/recipes.functions";
import { toast } from "sonner";
import { Sparkles, Plus, X, RotateCw, BarChart3, Bookmark, Play, Pause, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/geladeira")({
  component: GeladeiraPage,
});

const CATEGORIES: Array<{ label: string; items: string[] }> = [
  { label: "🥩 Proteínas", items: ["frango", "carne moída", "peixe", "ovos", "linguiça"] },
  { label: "🥬 Vegetais", items: ["tomate", "cebola", "alho", "cenoura", "alface", "batata"] },
  { label: "🌾 Grãos", items: ["arroz", "feijão", "macarrão", "aveia", "lentilha"] },
  { label: "🧀 Laticínios", items: ["leite", "queijo", "creme de leite", "iogurte", "manteiga"] },
  { label: "🍎 Frutas", items: ["banana", "maçã", "limão", "laranja", "morango"] },
  { label: "🌶️ Temperos", items: ["sal", "pimenta", "orégano", "cominho", "páprica"] },
];

function GeladeiraPage() {
  const navigate = useNavigate();
  const call = useServerFn(generateRecipe);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<FridgeRecipe | null>(null);

  function addIngredient(name: string) {
    const clean = name.trim().toLowerCase();
    if (!clean) return;
    setIngredients((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
  }

  function handleCategory(cat: (typeof CATEGORIES)[number]) {
    const remaining = cat.items.filter((i) => !ingredients.includes(i));
    const pick = (remaining.length ? remaining : cat.items)[
      Math.floor(Math.random() * (remaining.length || cat.items.length))
    ];
    addIngredient(pick);
    setActiveChip(cat.label);
    setTimeout(() => setActiveChip(null), 300);
  }

  async function generate() {
    if (ingredients.length === 0) {
      toast.error("Adicione pelo menos um ingrediente");
      return;
    }
    setLoading(true);
    try {
      const r = await call({ data: { ingredients } });
      setRecipe(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar receita");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setIngredients([]);
    setRecipe(null);
    setInput("");
  }

  return (
    <AppShell>
      <ScreenHeader
        title="🧊 Geladeira Inteligente"
        subtitle="Adicione os ingredientes que você tem e a IA cria receitas para você"
      />

      {/* Categories */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            onClick={() => handleCategory(c)}
            className={`chip ${activeChip === c.label ? "chip-active" : ""}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mb-4 flex gap-2">
        <input
          className="input-field"
          placeholder="Ex: frango, arroz, tomate..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addIngredient(input);
              setInput("");
            }
          }}
        />
        <button
          className="btn-primary shrink-0"
          aria-label="Adicionar ingrediente"
          onClick={() => {
            addIngredient(input);
            setInput("");
          }}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Tags */}
      <div className="mb-4 flex min-h-[40px] flex-wrap gap-2">
        {ingredients.length === 0 && (
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            Nenhum ingrediente ainda. Toque nas categorias acima ou digite abaixo.
          </span>
        )}
        {ingredients.map((i) => (
          <span key={i} className="chip">
            {i}
            <button
              aria-label={`Remover ${i}`}
              onClick={() => setIngredients((prev) => prev.filter((x) => x !== i))}
              className="ml-1 opacity-70 hover:opacity-100"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <button
          className="btn-primary flex-1"
          onClick={generate}
          disabled={loading || ingredients.length === 0}
        >
          <Sparkles size={16} /> {loading ? "Gerando..." : "Gerar Receita com IA"}
        </button>
        <button className="btn-secondary" onClick={clearAll} disabled={loading}>
          Limpar
        </button>
      </div>

      {loading && <TypingIndicator label="Analisando ingredientes com IA..." />}

      {recipe && !loading && (
        <div className="fade-up glass mt-2 p-5">
          <div className="mb-2 text-5xl">{recipe.emoji}</div>
          <h2 className="text-xl font-semibold">{recipe.name}</h2>
          <span className="chip mt-2 inline-flex">
            <Sparkles size={12} /> Gerado por IA com base nos seus ingredientes
          </span>

          <div className="my-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Tempo", value: recipe.time },
              { label: "Porções", value: recipe.servings },
              { label: "Dificuldade", value: recipe.difficulty },
              { label: "Calorias", value: recipe.calories },
            ].map((i) => (
              <div key={i.label} className="rounded-lg p-3" style={{ background: "var(--bg-2)" }}>
                <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                  {i.label}
                </div>
                <div className="mt-1 text-sm font-semibold">{i.value}</div>
              </div>
            ))}
          </div>

          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            {recipe.description}
          </p>

          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--brand-2)" }}>
              Ingredientes
            </h3>
            <ul className="space-y-1 text-sm">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} style={{ color: "var(--text-1)" }}>
                  • {ing}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--brand-2)" }}>
              Modo de preparo
            </h3>
            <ol className="space-y-2">
              {recipe.steps.map((s, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--brand)" }}
                  >
                    {idx + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button className="btn-secondary flex-1" onClick={generate} disabled={loading}>
              <RotateCw size={14} /> Outra receita
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => navigate({ to: "/nutri" })}
            >
              <BarChart3 size={14} /> Info nutricional
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
