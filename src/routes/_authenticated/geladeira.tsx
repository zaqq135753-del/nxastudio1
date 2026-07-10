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
  const callImage = useServerFn(generateRecipeImage);
  const callSave = useServerFn(saveRecipe);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<FridgeRecipe | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cookingStep, setCookingStep] = useState<number | null>(null);

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
    setImageUrl(null);
    setSaved(false);
    try {
      const r = await call({ data: { ingredients } });
      setRecipe(r);
      // Gera imagem em paralelo (não bloqueia UI)
      setImageLoading(true);
      callImage({ data: { name: r.name, description: r.description } })
        .then((res) => setImageUrl(res.imageUrl))
        .catch(() => {/* silencioso, receita já apareceu */})
        .finally(() => setImageLoading(false));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar receita");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!recipe) return;
    setSaving(true);
    try {
      await callSave({
        data: {
          name: recipe.name,
          emoji: recipe.emoji,
          description: recipe.description,
          time: recipe.time,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          calories: recipe.calories,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          imageUrl: imageUrl ?? undefined,
          source: "geladeira",
        },
      });
      setSaved(true);
      toast.success("Receita salva em Minhas Receitas");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  function toggleLiveCooking() {
    if (!recipe) return;
    if (cookingStep === null) {
      setCookingStep(0);
      speak(`Passo 1. ${recipe.steps[0]}`);
    } else {
      const next = cookingStep + 1;
      if (next >= recipe.steps.length) {
        setCookingStep(null);
        speak("Pronto! Bom apetite.");
        return;
      }
      setCookingStep(next);
      speak(`Passo ${next + 1}. ${recipe.steps[next]}`);
    }
  }

  function stopCooking() {
    setCookingStep(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function clearAll() {
    stopCooking();
    setIngredients([]);
    setRecipe(null);
    setImageUrl(null);
    setSaved(false);
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
        <div className="fade-up glass mt-2 overflow-hidden p-0">
          {/* Hero image */}
          <div className="relative h-56 w-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
            {imageUrl ? (
              <img src={imageUrl} alt={recipe.name} className="h-full w-full object-cover" />
            ) : imageLoading ? (
              <div className="flex h-full w-full items-center justify-center gap-2 text-sm" style={{ color: "var(--text-3)" }}>
                <ImageIcon size={16} className="animate-pulse" /> Fotografando seu prato com IA…
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl">{recipe.emoji}</div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{recipe.name}</h2>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] text-white backdrop-blur-sm">
                <Sparkles size={10} /> Criado por IA
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Tempo", value: recipe.time },
                { label: "Porções", value: recipe.servings },
                { label: "Dificuldade", value: recipe.difficulty },
                { label: "Calorias", value: recipe.calories },
              ].map((i) => (
                <div key={i.label} className="rounded-lg p-3" style={{ background: "var(--bg-2)" }}>
                  <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{i.label}</div>
                  <div className="mt-1 text-sm font-semibold">{i.value}</div>
                </div>
              ))}
            </div>

            <p className="text-sm" style={{ color: "var(--text-2)" }}>{recipe.description}</p>

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--brand-2)" }}>Ingredientes</h3>
              <ul className="space-y-1 text-sm">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ color: "var(--text-1)" }}>• {ing}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--brand-2)" }}>Modo de preparo</h3>
                <button
                  onClick={cookingStep === null ? toggleLiveCooking : stopCooking}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: "var(--brand)", color: "white" }}
                >
                  {cookingStep === null ? <><Play size={12} /> Modo Chef (voz)</> : <><Pause size={12} /> Parar</>}
                </button>
              </div>
              <ol className="space-y-2">
                {recipe.steps.map((s, idx) => (
                  <li
                    key={idx}
                    className={`flex gap-3 rounded-lg p-2 text-sm transition-colors ${cookingStep === idx ? "ring-2" : ""}`}
                    style={cookingStep === idx ? { background: "var(--bg-2)", boxShadow: "inset 0 0 0 2px var(--brand)" } : undefined}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: cookingStep === idx ? "var(--tomato, var(--brand))" : "var(--brand)" }}
                    >
                      {idx + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              {cookingStep !== null && (
                <button onClick={toggleLiveCooking} className="btn-primary mt-3 w-full">
                  {cookingStep + 1 >= recipe.steps.length ? "Finalizar" : "Próximo passo →"}
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <button className="btn-primary" onClick={handleSave} disabled={saving || saved}>
                <Bookmark size={14} /> {saved ? "Salva" : saving ? "Salvando..." : "Salvar receita"}
              </button>
              <button className="btn-secondary" onClick={generate} disabled={loading}>
                <RotateCw size={14} /> Outra
              </button>
              <button className="btn-secondary" onClick={() => navigate({ to: "/nutri" })}>
                <BarChart3 size={14} /> Nutri
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
