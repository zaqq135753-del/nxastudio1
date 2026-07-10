import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { AIResult, AuroraBackdrop } from "@/components/ui/ai-result";
import { quickIdeas, type QuickIdeasResult } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Sparkles, Timer, X, Plus, Utensils } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/saboria/agora")({
  component: Page,
});

const MOODS = ["leve", "reconfortante", "rápido", "saudável", "indulgente"];
const TIMES = [10, 20, 30, 45];

function Page() {
  const call = useServerFn(quickIdeas);
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [time, setTime] = useState(20);
  const [mood, setMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<QuickIdeasResult | null>(null);

  function add(x: string) {
    const c = x.trim().toLowerCase();
    if (!c || items.includes(c)) return;
    setItems([...items, c]);
    setInput("");
  }

  async function run() {
    setLoading(true); setRes(null);
    try { setRes(await call({ data: { ingredients: items, time_min: time, mood: mood ?? undefined } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell>
      <AuroraBackdrop />
      <ScreenHeader title="O que faço agora?" subtitle="3 ideias em segundos, com o que você tem." />

      <div className="glass-card p-5 space-y-5 animate-fade-in">
        <div>
          <label className="text-sm font-medium mb-2 block">O que você tem?</label>
          <div className="flex gap-2 mb-2">
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),add(input))}
              placeholder="ovos, arroz, tomate…"
              className="flex-1 rounded-xl bg-background/60 border border-border/50 px-3 py-2 text-sm" />
            <Button onClick={()=>add(input)} variant="secondary" size="sm"><Plus className="w-4 h-4"/></Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {items.map(i=>(
              <button key={i} onClick={()=>setItems(items.filter(x=>x!==i))}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1 hover-scale">
                {i}<X className="w-3 h-3"/>
              </button>
            ))}
            {items.length===0 && <span className="text-xs text-muted-foreground">Sem nada? A IA sugere com básicos de despensa.</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1.5"><Timer className="w-4 h-4"/>Tempo</label>
            <div className="flex gap-1.5">
              {TIMES.map(t=>(
                <button key={t} onClick={()=>setTime(t)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${time===t?"bg-primary text-primary-foreground":"bg-muted/50 hover:bg-muted"}`}>
                  {t}m
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Humor</label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map(m=>(
                <button key={m} onClick={()=>setMood(mood===m?null:m)}
                  className={`text-xs px-2.5 py-1 rounded-full transition ${mood===m?"bg-primary text-primary-foreground":"bg-muted/50 hover:bg-muted"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={run} disabled={loading} className="w-full press">
          <Sparkles className="w-4 h-4 mr-2"/>{loading?"Pensando…":"Me dá 3 ideias"}
        </Button>
      </div>

      {loading && <div className="mt-6"><TypingIndicator label="Combinando sabores…"/></div>}

      {res && (
        <div className="mt-6 space-y-4 animate-fade-in">
          <p className="text-sm text-muted-foreground italic">{res.intro}</p>
          {res.ideas.map((idea, i) => (
            <AIResult key={i} title={idea.title} icon={<Utensils className="w-5 h-5 text-white"/>}
              badge={`${idea.time_min} min`} tone={i===1?"cool":"warm"}>
              <p className="text-sm text-muted-foreground mb-3">{idea.why}</p>
              <div className="mb-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Ingredientes</div>
                <div className="flex flex-wrap gap-1">
                  {idea.ingredients.map(x=><span key={x} className="text-xs bg-muted/60 px-2 py-0.5 rounded-full">{x}</span>)}
                </div>
              </div>
              <ol className="space-y-1.5 text-sm">
                {idea.steps.map((s,j)=>(
                  <li key={j} className="flex gap-2"><span className="text-primary font-semibold">{j+1}.</span><span>{s}</span></li>
                ))}
              </ol>
            </AIResult>
          ))}
        </div>
      )}
    </AppShell>
  );
}
