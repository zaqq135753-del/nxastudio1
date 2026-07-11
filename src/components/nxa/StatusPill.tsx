import { Sparkles, Lock, Clock, Check } from "lucide-react";

type Kind = "trial" | "prime" | "base" | "locked" | "available";

const MAP: Record<Kind, { label: string; icon: typeof Check }> = {
  trial:     { label: "Trial",     icon: Clock },
  prime:     { label: "Prime",     icon: Sparkles },
  base:      { label: "Ativo",     icon: Check },
  locked:    { label: "Bloqueado", icon: Lock },
  available: { label: "Disponível",icon: Sparkles },
};

export function StatusPill({ kind, extra }: { kind: Kind; extra?: string }) {
  const { label, icon: Icon } = MAP[kind];
  return (
    <span className="chip chip-neutral inline-flex items-center gap-1 whitespace-nowrap">
      <Icon size={11} />
      {label}{extra ? ` · ${extra}` : ""}
    </span>
  );
}
