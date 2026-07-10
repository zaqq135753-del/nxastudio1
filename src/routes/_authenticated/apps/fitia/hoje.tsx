import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader, TypingIndicator } from "@/components/layout/AppShell";
import { AIResult, AuroraBackdrop } from "@/components/ui/ai-result";
import { todayWorkout, type Workout } from "@/lib/fit.functions";
import { Button } from "@/components/ui/button";
import { Dumbbell, Home, Trees, Building2, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/fitia/hoje")({
  component: Page,
});

const LOCS = [
  { v: "casa", label: "Casa", icon: Home },
  { v: "academia", label: "Academia", icon: Building2 },
  { v: "ar_livre", label: "Ar livre", icon: Trees },
] as const;

function Page() {
  const call = useServerFn(todayWorkout);
  const [energy, setEnergy] = useState<1|2|3|4|5>(3);
  const [time, setTime] = useState(30);
  const [loc, setLoc] = useState<"casa"|"academia"|"ar_livre">("casa");
  const [pain, setPain] = useState("");
  const [loading, setLoading] = useState(false);
  const [w, setW] = useState<Workout | null>(null);

  async function run() {
    setLoading(true); setW(null);
    try { setW(await call({ data: { energy, time_min: time, location: loc, pain: pain || undefined } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="fitia">
      <AuroraBackdrop />
      <ScreenHeader title="Treino de hoje" subtitle="Adaptado à sua energia, tempo e corpo agora." />

      <div className="glass-card p-5 space-y-5 animate-fade-in">
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-1.5"><Zap className="w-4 h-4"/>Energia</label>
          <div className="flex gap-1.5">
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setEnergy(n as 1|2|3|4|5)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${energy===n?"bg-primary text-primary-foreground":"bg-muted/50 hover:bg-muted"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tempo disponível</label>
          <div className="flex gap-1.5">
            {[15,30,45,60].map(t=>(
              <button key={t} onClick={()=>setTime(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${time===t?"bg-primary text-primary-foreground":"bg-muted/50 hover:bg-muted"}`}>
                {t}m
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Onde</label>
          <div className="grid grid-cols-3 gap-1.5">
            {LOCS.map(({v,label,icon:Icon})=>(
              <button key={v} onClick={()=>setLoc(v)}
                className={`rounded-lg py-3 text-sm font-medium transition flex flex-col items-center gap-1 ${loc===v?"bg-primary text-primary-foreground":"bg-muted/50 hover:bg-muted"}`}>
                <Icon className="w-4 h-4"/>{label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Alguma dor ou limitação hoje? (opcional)</label>
          <input value={pain} onChange={e=>setPain(e.target.value)}
            placeholder="ex.: joelho, lombar…"
            className="w-full rounded-xl bg-background/60 border border-border/50 px-3 py-2 text-sm" />
        </div>

        <Button onClick={run} disabled={loading} className="w-full press">
          <Dumbbell className="w-4 h-4 mr-2"/>{loading?"Montando…":"Gerar treino de hoje"}
        </Button>
      </div>

      {loading && <div className="mt-6"><TypingIndicator label="Ajustando ao seu dia…"/></div>}

      {w && (
        <div className="mt-6 animate-fade-in">
          <AIResult title={w.title} badge={`${w.duration_min} min · ${w.difficulty}`} icon={<Dumbbell className="w-5 h-5 text-white"/>}>
            <p className="text-sm text-muted-foreground mb-4">Foco: {w.focus}</p>

            <Section title="Aquecimento">
              <ul className="text-sm space-y-1">{w.warmup.map((x,i)=><li key={i}>• {x}</li>)}</ul>
            </Section>

            <Section title="Exercícios">
              <div className="space-y-2">
                {w.exercises.map((e,i)=>(
                  <div key={i} className="rounded-xl bg-background/40 border border-border/40 p-3">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="font-semibold text-sm">{i+1}. {e.name}</div>
                      <div className="text-xs text-muted-foreground">{e.sets}×{e.reps} · desc {e.rest_s}s</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{e.tips}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Volta à calma">
              <ul className="text-sm space-y-1">{w.cooldown.map((x,i)=><li key={i}>• {x}</li>)}</ul>
            </Section>
          </AIResult>
        </div>
      )}
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}
