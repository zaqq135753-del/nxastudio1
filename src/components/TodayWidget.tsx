import { Link } from "@tanstack/react-router";
import { APPS, type AppEntry } from "@/apps/registry";
import { isEntitled, type Entitlement } from "@/lib/entitlements.functions";
import { ArrowUpRight, Sun, Moon, Sunrise, Sunset } from "lucide-react";

/**
 * Widget "Hoje" — próximo passo do dia por app ativo.
 * Determinístico (sem custo de IA); rota escolhida por período do dia.
 */
type Slot = { label: string; to: string; hint: string };

function slotFor(app: AppEntry, hour: number): Slot | null {
  const morning = hour < 12;
  const evening = hour >= 18;
  switch (app.slug) {
    case "saboria":
      return morning
        ? { label: "Café da manhã", to: "/apps/saboria/nutri", hint: "sugestão para hoje" }
        : evening
        ? { label: "Jantar de hoje", to: "/apps/saboria/geladeira", hint: "com o que tem em casa" }
        : { label: "Almoço rápido", to: "/apps/saboria/nutri", hint: "receita em 20 min" };
    case "fitia":
      return { label: "Treino de hoje", to: "/apps/fitia/treino", hint: morning ? "vamos começar" : "ainda dá tempo" };
    case "granaia":
      return { label: "Gastos do dia", to: "/apps/granaia/transacoes", hint: "registrar em 10s" };
    case "glowia":
      return morning
        ? { label: "Rotina AM", to: "/apps/glowia/rotina", hint: "3 passos" }
        : { label: "Rotina PM", to: "/apps/glowia/rotina", hint: "antes de dormir" };
    case "fluencyia":
      return { label: "Praticar 5 min", to: "/apps/fluencyia/conversar", hint: "conversa curta" };
    case "socialia":
      return { label: "Ideia de post", to: "/apps/socialia/gerador", hint: "gerar agora" };
    case "petia":
      return { label: "Check-in do pet", to: "/apps/petia/saude", hint: "como ele está?" };
    case "styleia":
      return { label: "Look de hoje", to: "/apps/styleia/look", hint: "montar rápido" };
    case "cosmosia":
      return { label: "Horóscopo do dia", to: "/apps/cosmosia", hint: "sua energia" };
    case "roteiroia":
      return { label: "Meus roteiros", to: "/apps/roteiroia/meus", hint: "retomar" };
    default:
      return null;
  }
}

function periodIcon(hour: number) {
  if (hour < 6) return Moon;
  if (hour < 12) return Sunrise;
  if (hour < 18) return Sun;
  return Sunset;
}

export function TodayWidget({ ents }: { ents: Entitlement[] }) {
  const hour = new Date().getHours();
  const Icon = periodIcon(hour);
  const active = APPS.filter((a) => a.status === "live" && isEntitled(ents, a.slug));
  const cards = active.map((a) => ({ app: a, slot: slotFor(a, hour) })).filter((c) => c.slot);

  if (cards.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 edition-tag">
          <Icon size={13} /> Hoje · seu próximo passo
        </div>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {cards.length} ação{cards.length === 1 ? "" : "es"}
        </span>
      </div>

      <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ app, slot }) => (
          <Link
            key={app.slug}
            to={slot!.to}
            className="press glass-card group flex items-center gap-3 rounded-2xl p-4"
          >
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
              style={{ background: "var(--n-100)" }}
            >
              <app.icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                {app.name}
              </div>
              <div className="text-[15px] font-semibold tracking-tight truncate">{slot!.label}</div>
              <div className="text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>
                {slot!.hint}
              </div>
            </div>
            <ArrowUpRight
              size={16}
              className="opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
