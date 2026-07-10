import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { AIResult, AuroraBackdrop } from "@/components/ui/ai-result";
import { todayRoutine, type TodayRoutine } from "@/lib/glow.functions";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/glowia/hoje")({
  component: Page,
});

const WEATHERS = ["seco","úmido","frio","calor","poluído"];
const FEELINGS = ["normal","oleosa","desidratada","sensível","com espinha"];

function Page() {
  const call = useServerFn(todayRoutine);
  const [period, setPeriod] = useState<"AM"|"PM">(new Date().getHours() < 15 ? "AM" : "PM");
  const [weather, setWeather] = useState<string|null>(null);
  const [feeling, setFeeling] = useState<string|null>(null);
  const [uv, setUv] = useState(5);
  const [loading, setLoading] = useState(false);
  const [r, setR] = useState<TodayRoutine | null>(null);

  async function run() {
    setLoading(true); setR(null);
    try { setR(await call({ data: { period, weather: weather ?? undefined, feeling: feeling ?? undefined, uv_index: period==="AM"?uv:undefined } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="glowia">
      <AuroraBackdrop />
      <ScreenHeader title="Rotina de hoje" subtitle="Personalizada pro clima, UV e como sua pele está agora." />

      <div className="glass-card p-5 space-y-5 animate-fade-in">
        <div className="grid grid-cols-2 gap-2">
          {(["AM","PM"] as const).map(p=>{
            const Icon = p==="AM"?Sun:Moon;
            return (
              <button key={p} onClick={()=>setPeriod(p)}
                className={`rounded-xl py-3 font-medium transition flex items-center justify-center gap-2 ${period===p?"bg-primary text-primary-foreground":"bg-muted/50 hover:bg-muted"}`}>
                <Icon className="w-4 h-4"/>{p==="AM"?"Manhã":"Noite"}
              </button>
            );
          })}
        </div>

        {period==="AM" && (
          <div>
            <label className="text-sm font-medium mb-2 block">Índice UV: <span className="text-primary">{uv}</span></label>
            <input type="range" min={0} max={12} value={uv} onChange={e=>setUv(+e.target.value)}
              className="w-full accent-primary" />
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">Clima</label>
          <div className="flex flex-wrap gap-1.5">
            {WEATHERS.map(w=>(
              <button key={w} onClick={()=>setWeather(weather===w?null:w)}
                className={`text-xs px-2.5 py-1 rounded-full transition ${weather===w?"bg-primary text-primary-foreground":"bg-muted/50 hover:bg-muted"}`}>
                {w}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Como sua pele está?</label>
          <div className="flex flex-wrap gap-1.5">
            {FEELINGS.map(f=>(
              <button key={f} onClick={()=>setFeeling(feeling===f?null:f)}
                className={`text-xs px-2.5 py-1 rounded-full transition ${feeling===f?"bg-primary text-primary-foreground":"bg-muted/50 hover:bg-muted"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={run} disabled={loading} className="w-full press">
          <Sparkles className="w-4 h-4 mr-2"/>{loading?"Montando…":"Gerar rotina de hoje"}
        </Button>
      </div>

      {loading && <div className="mt-6"><TypingIndicator label="Consultando ativos…"/></div>}

      {r && (
        <div className="mt-6 animate-fade-in">
          <AIResult title={`Rotina ${r.period}`} badge={`${r.steps.length} passos`}
            icon={r.period==="AM"?<Sun className="w-5 h-5 text-white"/>:<Moon className="w-5 h-5 text-white"/>}
            tone={r.period==="AM"?"gold":"cool"}>
            <p className="text-sm text-muted-foreground italic mb-4">{r.context_tip}</p>

            <ol className="space-y-2">
              {r.steps.map(s=>(
                <li key={s.order} className="rounded-xl bg-background/40 border border-border/40 p-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="font-semibold text-sm">{s.order}. {s.step}</div>
                    <div className="text-xs text-muted-foreground">{s.time_sec}s</div>
                  </div>
                  <div className="text-xs text-primary mb-1">{s.product}</div>
                  <div className="text-xs text-muted-foreground">{s.why}</div>
                </li>
              ))}
            </ol>

            {r.warning && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5"/>
                <span>{r.warning}</span>
              </div>
            )}
          </AIResult>
        </div>
      )}
    </AppShell>
  );
}
