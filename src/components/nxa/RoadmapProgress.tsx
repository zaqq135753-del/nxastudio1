import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMVPRoadmap, type RoadmapStep } from "@/lib/roadmap.functions";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export function RoadmapProgress() {
  const load = useServerFn(getMVPRoadmap);
  const { data: roadmap, isLoading } = useQuery({
    queryKey: ["mvp-roadmap"],
    queryFn: () => load() as Promise<RoadmapStep[]>,
  });

  if (isLoading || !roadmap) return <div className="animate-pulse h-32 bg-muted/20 rounded-3xl" />;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {roadmap.map((step) => {
        const isCompleted = step.status === 'completed';
        const isInProgress = step.status === 'in-progress';
        
        return (
          <div key={step.id} className="surface p-4 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] uppercase tracking-widest font-bold ${
                isCompleted ? 'text-primary' : 
                isInProgress ? 'text-amber-500' : 'text-muted-foreground'
              }`}>
                {isCompleted ? 'Concluído' : isInProgress ? 'Em curso' : 'Pendente'}
              </span>
              {isCompleted ? (
                <CheckCircle2 size={14} className="text-primary" />
              ) : isInProgress ? (
                <Clock size={14} className="text-amber-500 animate-pulse" />
              ) : (
                <Circle size={14} className="text-muted-foreground" />
              )}
            </div>
            <h4 className="text-sm font-semibold leading-tight">{step.title}</h4>
            <div className="space-y-1">
              {step.tasks.map((task: string, i: number) => (
                <div key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <div className={`h-1 w-1 rounded-full ${isCompleted ? 'bg-primary/50' : 'bg-muted-foreground/30'}`} />
                  {task}
                </div>
              ))}
            </div>
            {isInProgress && (
              <div className="absolute bottom-0 left-0 h-0.5 bg-amber-500 w-2/3" />
            )}
          </div>
        );
      })}
    </div>
  );
}
