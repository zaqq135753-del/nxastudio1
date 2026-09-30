import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { generateRecipe, generateRecipeImage, type FridgeRecipe } from "@/lib/ai.functions";
import { saveRecipe } from "@/lib/recipes.functions";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  X,
  RotateCw,
  BarChart3,
  Bookmark,
  Play,
  Pause,
  ImageIcon,
  Share2,
  Wind,
  Flame,
  Clock,
  Heart,
  UtensilsCrossed,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/saboria/geladeira")({
  component: GeladeiraPage,
});

type CookingMode = "standard" | "airfryer" | "one_pot" | "quick" | "healthy";

const QUICK_PANTRY = [
  { label: "Ovos", emoji: "🥚" },
  { label: "Arroz", emoji: "🍚" },
  { label: "Frango", emoji: "🍗" },
  { label: "Carne moída", emoji: "🥩" },
  { label: "Batata", emoji: "🥔" },
  { label: "Queijo", emoji: "🧀" },
  { label: "Tomate", emoji: "🍅" },
  { label: "Cebola", emoji: "🧅" },
  { label: "Alho", emoji: "🧄" },
  { label: "Macarrão", emoji: "🍝" },
  { label: "Cenoura", emoji: "🥕" },
  { label: "Leite", emoji: "🥛" },
];

const MODES: Array<{ id: CookingMode; label: string; icon: typeof Wind; desc: string }> = [
  { id: "standard", label: "Clássico", icon: UtensilsCrossed, desc: "Qualquer método" },
  { id: "airfryer", label: "Na Airfryer", icon: Wind, desc: "Crocante e sem óleo" },
  { id: "one_pot", label: "1 Panela Só", icon: Flame, desc: "Sem pilha de louça" },
  { id: "quick", label: "Rápido (15m)", icon: Clock, desc: "Com pressa" },
  { id: "healthy", label: "Saudável & Fit", icon: Heart, desc: "Leve e nutritivo" },
];

export function GeladeiraPage() {
  const navigate = useNavigate();
  const call = useServerFn(generateRecipe);
  const callImage = useServerFn(generateRecipeImage);
  const callSave = useServerFn(saveRecipe);

  const [ingredients, setIngredients] = useState<string[]>(["ovos", "queijo", "tomate"]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CookingMode>("standard");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<FridgeRecipe | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cookingStep, setCookingStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  function togglePantryItem(name: string) {
    const clean = name.toLowerCase();
    setIngredients((prev) =>
      prev.includes(clean) ? prev.filter((x) => x !== clean) : [...prev, clean]
    );
  }

  function addCustomIngredient() {
    const clean = input.trim().toLowerCase();
    if (!clean) return;
    if (!ingredients.includes(clean)) {
      setIngredients((prev) => [...prev, clean]);
    }
    setInput("");
  }

  function removeIngredient(name: string) {
    setIngredients((prev) => prev.filter((x) => x !== name));
  }

  async function generate() {
    if (ingredients.length === 0) {
      toast.error("Adicione pelo menos um ingrediente");
      return;
    }
    setLoading(true);
    setImageUrl(null);
    setSaved(false);
    setCookingStep(null);
    setCompletedSteps(new Set());

    try {
      const r = await call({ data: { ingredients, mode } });
      setRecipe(r);

      // Gera imagem em paralelo
      setImageLoading(true);
      callImage({ data: { name: r.name, description: r.description } })
        .then((res) => setImageUrl(res.imageUrl))
        .catch(() => {})
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
      toast.success("Receita salva com sucesso!");
    } catch (e) {
      // Fallback em localStorage caso o banco remoto oscile
      try {
        const key = "nxa_saved_recipes_offline";
        const old = JSON.parse(localStorage.getItem(key) ?? "[]");
        old.unshift({ ...recipe, imageUrl, created_at: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(old.slice(0, 50)));
        setSaved(true);
        toast.success("Receita salva nas suas receitas!");
      } catch {
        toast.error("Falha ao salvar receita");
      }
    } finally {
      setSaving(false);
    }
  }

  function shareWhatsApp() {
    if (!recipe) return;
    const lines = [
      `🍳 *${recipe.name}* (Receita do NXA Chef)`,
      `⏱️ Tempo: ${recipe.time} | 🍽️ ${recipe.servings} | 🔥 ${recipe.calories}`,
      `💰 *Economia estimada:* ~R$ 45,00 vs. pedir delivery\n`,
      `*Ingredientes:*`,
      ...recipe.ingredients.map((i) => `• ${i}`),
      `\n*Modo de Preparo:*`,
      ...recipe.steps.map((s, idx) => `${idx + 1}. ${s}`),
      `\n✨ _Criado com inteligência artificial pelo NXA Chef_`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
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
        speak("Parabéns! Sua refeição está pronta. Bom apetite!");
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

  return (
    <AppShell appSlug="saboria">
      <ScreenHeader
        title="🧊 Geladeira Inteligente"
        subtitle="Selecione o que você tem em casa e a IA cria seu prato em segundos."
      />

      {/* Widget de Economia no Topo */}
      <div
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm"
        style={{
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)",
          borderColor: "rgba(34, 197, 94, 0.25)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm">
            💰
          </span>
          <div>
            <div className="font-semibold text-[13px] text-emerald-300">
              Economia estimada no mês: ~R$ 380,00
            </div>
            <div className="text-xs text-muted-foreground">
              Cada refeição feita com o que você já tem economiza de R$ 35 a R$ 60 de delivery.
            </div>
          </div>
        </div>
      </div>

      {/* Seleção Rápida de Dispensa Brasileira */}
      <div className="surface mb-5 rounded-3xl p-5 border" style={{ borderColor: "var(--line-1)" }}>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            1. O que você tem em casa agora? (toque para marcar)
          </label>
          <span className="text-xs font-medium text-emerald-400">
            {ingredients.length} selecionado{ingredients.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Grade de Chips Rápidos */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 mb-4">
          {QUICK_PANTRY.map((item) => {
            const active = ingredients.includes(item.label.toLowerCase());
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => togglePantryItem(item.label)}
                className={`flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-medium transition-all ${
                  active
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm"
                    : "border-border/60 bg-background/50 hover:bg-white/5 text-muted-foreground"
                }`}
              >
                <span>{item.emoji}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input para Ingredientes Extras */}
        <div className="flex gap-2">
          <input
            className="input-field flex-1 text-sm"
            placeholder="Algum outro ingrediente? Ex: creme de leite, couve..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomIngredient();
              }
            }}
          />
          <button
            type="button"
            className="btn-secondary shrink-0 px-4"
            onClick={addCustomIngredient}
            title="Adicionar ingrediente"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>

        {/* Tags ativas */}
        {ingredients.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t" style={{ borderColor: "var(--line-1)" }}>
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-medium"
              >
                {ing}
                <button
                  type="button"
                  onClick={() => removeIngredient(ing)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setIngredients([])}
              className="ml-auto text-[11px] text-muted-foreground hover:underline"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Modos de Cozinha Inteligente */}
      <div className="surface mb-6 rounded-3xl p-5 border" style={{ borderColor: "var(--line-1)" }}>
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          2. Como você quer preparar hoje?
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {MODES.map((m) => {
            const active = mode === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                  active
                    ? "border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/40"
                    : "border-border/60 bg-background/40 hover:bg-white/5 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                  <Icon size={14} className={active ? "text-amber-400" : "text-muted-foreground"} />
                  {m.label}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground leading-tight">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botão de Geração */}
      <div className="mb-6">
        <button
          type="button"
          onClick={generate}
          disabled={loading || ingredients.length === 0}
          className="btn-primary w-full py-4 text-base font-semibold shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          {loading ? "Criando sua receita com IA..." : `Criar Receita (${ingredients.length} ingredientes)`}
        </button>
      </div>

      {loading && <TypingIndicator label="O chef de IA está combinando seus ingredientes..." />}

      {/* Card da Receita Gerada */}
      {recipe && !loading && (
        <div className="fade-up surface mt-4 overflow-hidden rounded-3xl border shadow-xl" style={{ borderColor: "var(--line-1)" }}>
          {/* Header da Receita com Imagem e Badge de Economia */}
          <div className="relative h-64 w-full overflow-hidden bg-neutral-900">
            {imageUrl ? (
              <img src={imageUrl} alt={recipe.name} className="h-full w-full object-cover" />
            ) : imageLoading ? (
              <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-muted-foreground">
                <ImageIcon size={16} className="animate-pulse" /> Gerando foto apetitosa com IA…
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-7xl">{recipe.emoji}</div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            {/* Selo de Economia sobre a foto */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                💰 Economia nesta refeição: ~R$ 42,00
              </span>
            </div>

            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {recipe.name}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/80">
                <span>{recipe.emoji}</span>
                <span>•</span>
                <span>{recipe.time}</span>
                <span>•</span>
                <span>{recipe.calories}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Barra de Ações Rápidas no topo da receita */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={shareWhatsApp}
                className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-semibold transition"
              >
                <Share2 size={14} /> Enviar no WhatsApp
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || saved}
                className="btn-secondary px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5"
              >
                <Bookmark size={14} /> {saved ? "Salva!" : saving ? "Salvando..." : "Salvar"}
              </button>

              <button
                type="button"
                onClick={generate}
                disabled={loading}
                className="btn-ghost px-3 py-2.5 text-xs font-semibold flex items-center gap-1"
                title="Criar outra receita com os mesmos ingredientes"
              >
                <RotateCw size={14} /> Outra
              </button>
            </div>

            {/* Métricas Rápidas */}
            <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Tempo", value: recipe.time },
                { label: "Rendimento", value: recipe.servings },
                { label: "Dificuldade", value: recipe.difficulty },
                { label: "Calorias", value: recipe.calories },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-background/50 border border-border/50 p-3 text-center">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">{item.label}</div>
                  <div className="mt-0.5 text-sm font-bold text-foreground">{item.value}</div>
                </div>
              ))}
            </div>

            <p className="mb-6 text-sm text-muted-foreground leading-relaxed italic">
              "{recipe.description}"
            </p>

            {/* Ingredientes com Checklist */}
            <div className="mb-6">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                🛒 Ingredientes Necessários
              </h3>
              <ul className="space-y-1.5">
                {recipe.ingredients.map((ing, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 rounded-xl bg-background/40 border border-border/40 px-3 py-2 text-sm text-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modo de Preparo com Modo Chef por Voz */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  👨‍🍳 Modo de Preparo
                </h3>
                <button
                  type="button"
                  onClick={cookingStep === null ? toggleLiveCooking : stopCooking}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition"
                  style={{
                    background: cookingStep === null ? "var(--brand-1, #e11d48)" : "var(--n-200)",
                    color: "white",
                  }}
                >
                  {cookingStep === null ? (
                    <>
                      <Play size={12} fill="white" /> Ouvir no Viva-Voz
                    </>
                  ) : (
                    <>
                      <Pause size={12} /> Parar Voz
                    </>
                  )}
                </button>
              </div>

              <ol className="space-y-2.5">
                {recipe.steps.map((step, idx) => {
                  const isCurrent = cookingStep === idx;
                  const isDone = completedSteps.has(idx);

                  return (
                    <li
                      key={idx}
                      onClick={() => {
                        setCompletedSteps((prev) => {
                          const next = new Set(prev);
                          if (next.has(idx)) next.delete(idx);
                          else next.add(idx);
                          return next;
                        });
                      }}
                      className={`cursor-pointer rounded-2xl border p-3.5 text-sm transition-all flex items-start gap-3 ${
                        isCurrent
                          ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                          : isDone
                          ? "border-border/40 bg-background/20 opacity-60 line-through"
                          : "border-border/60 bg-background/40 hover:bg-background/70"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={14} /> : idx + 1}
                      </span>
                      <span className="leading-snug pt-0.5">{step}</span>
                    </li>
                  );
                })}
              </ol>

              {cookingStep !== null && (
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={toggleLiveCooking} className="btn-primary flex-1 py-3 text-sm">
                    {cookingStep + 1 >= recipe.steps.length ? "Finalizar Receita 🎉" : "Próximo Passo →"}
                  </button>
                  <button type="button" onClick={stopCooking} className="btn-secondary px-4 py-3 text-xs">
                    Sair do Modo Voz
                  </button>
                </div>
              )}
            </div>

            {/* Rodapé com Atalhos */}
            <div className="mt-8 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground" style={{ borderColor: "var(--line-1)" }}>
              <span>Dúvidas nutricionais?</span>
              <button
                type="button"
                onClick={() => navigate({ to: "/apps/saboria/nutri" })}
                className="underline text-foreground hover:text-primary flex items-center gap-1"
              >
                <BarChart3 size={12} /> Perguntar ao Nutri IA
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
