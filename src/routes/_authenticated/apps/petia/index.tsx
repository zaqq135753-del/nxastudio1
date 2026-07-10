import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { usePets, petAgeLabel, petEmoji } from "@/hooks/use-pets";
import { dailyTip, type DailyTip, listVaccinations, listMeals } from "@/lib/pet.functions";
import { MessageCircleHeart, HeartPulse, Utensils, GraduationCap, Sparkles, ArrowRight, Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/petia/")({
  component: PetHome,
});

const quick = [
  { to: "/apps/petia/chat" as const, icon: MessageCircleHeart, title: "Chat Vet", desc: "Tire dúvidas com a IA" },
  { to: "/apps/petia/saude" as const, icon: HeartPulse, title: "Saúde", desc: "Peso, vacinas, relatório" },
  { to: "/apps/petia/alimentacao" as const, icon: Utensils, title: "Alimentação", desc: "Plano e refeições" },
  { to: "/apps/petia/treino" as const, icon: GraduationCap, title: "Treino", desc: "Comportamento e comandos" },
];

function PetHome() {
  const { pets, active, setActiveId } = usePets();
  const navigate = useNavigate();
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const [nextVac, setNextVac] = useState<string | null>(null);
  const [lastMeal, setLastMeal] = useState<string | null>(null);
  const [openPicker, setOpenPicker] = useState(false);

  const genTip = useServerFn(dailyTip);
  const fetchVacs = useServerFn(listVaccinations);
  const fetchMeals = useServerFn(listMeals);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const [vacs, meals] = await Promise.all([
        fetchVacs({ data: { petId: active.id } }),
        fetchMeals({ data: { petId: active.id } }),
      ]);
      const upcoming = (vacs as { next_booster: string | null; name: string }[])
        .filter((v) => v.next_booster).sort((a, b) => (a.next_booster! > b.next_booster! ? 1 : -1))[0];
      setNextVac(upcoming ? `${upcoming.name} · ${new Date(upcoming.next_booster!).toLocaleDateString("pt-BR")}` : null);
      const m = (meals as { type: string; created_at: string }[])[0];
      setLastMeal(m ? `${m.type} · ${new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : null);
    })();
  }, [active, fetchVacs, fetchMeals]);

  async function loadTip() {
    if (!active) return;
    setLoadingTip(true);
    try { setTip(await genTip({ data: { petId: active.id } })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoadingTip(false); }
  }

  if (pets === null) {
    return (
      <AppShell appSlug="petia">
        <div className="pt-16 text-center text-sm" style={{ color: "var(--n-500)" }}>Carregando…</div>
      </AppShell>
    );
  }

  if (pets.length === 0) {
    return (
      <AppShell appSlug="petia">
        <ScreenHeader title="🐾 PetIA" subtitle="Seu veterinário virtual e guia de cuidados com IA." />
        <div className="surface p-8 text-center fade-up">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-3xl" style={{ background: "var(--n-100)" }}>🐶</div>
          <h2 className="text-xl font-semibold">Cadastre seu primeiro pet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: "var(--n-500)" }}>
            Adicione seu cão ou gato para começar a receber cuidados personalizados.
          </p>
          <button onClick={() => navigate({ to: "/apps/petia/perfil" })} className="btn-primary mt-4 mx-auto">
            <Plus size={14} /> Adicionar pet
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell appSlug="petia">
      <ScreenHeader title="🐾 PetIA" subtitle="Seu veterinário virtual e guia de cuidados." />

      {/* Pet picker + card */}
      <section className="mb-6 fade-up">
        {pets.length > 1 && (
          <div className="relative mb-3">
            <button onClick={() => setOpenPicker((v) => !v)}
              className="chip chip-neutral inline-flex items-center gap-1.5">
              {petEmoji(active?.type ?? "")} {active?.name ?? "Selecionar"} <ChevronDown size={12} />
            </button>
            {openPicker && (
              <div className="absolute z-20 mt-2 w-56 rounded-xl border p-1 shadow-lg" style={{ background: "var(--card)", borderColor: "var(--line-1)" }}>
                {pets.map((p) => (
                  <button key={p.id} onClick={() => { setActiveId(p.id); setOpenPicker(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5">
                    <span>{petEmoji(p.type)}</span>
                    <span className="flex-1">{p.name}</span>
                    <span className="text-xs" style={{ color: "var(--n-500)" }}>{p.breed ?? ""}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {active && (
          <div className="surface p-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl overflow-hidden" style={{ background: "var(--n-100)" }}>
              {active.photo_url ? <img src={active.photo_url} alt="" className="h-full w-full object-cover" /> : petEmoji(active.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold tracking-tight">{active.name}</div>
              <div className="text-sm" style={{ color: "var(--n-500)" }}>
                {active.breed ?? "SRD"} · {petAgeLabel(active.birth_date)} · {active.weight ?? "?"} kg
              </div>
            </div>
            <Link to="/apps/petia/perfil" className="chip chip-neutral">Editar</Link>
          </div>
        )}
      </section>

      {/* Status grid */}
      <section className="mb-6 grid grid-cols-2 gap-3">
        <Stat icon="🍽️" label="Alimentação" value={lastMeal ?? "—"} sub="Última refeição" />
        <Stat icon="💉" label="Saúde" value={nextVac ?? "Em dia"} sub="Próxima vacina" />
        <Stat icon="🎾" label="Atividade" value="Hoje" sub="Registre um passeio" />
        <Stat icon="⚖️" label="Peso" value={active?.weight ? `${active.weight} kg` : "—"} sub="Último registro" />
      </section>

      {/* Quick actions */}
      <section className="stagger mb-8 grid grid-cols-2 gap-3">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="tile-hero group">
            <div className="flex items-start justify-between">
              <div className="tile-icon-wrap"><q.icon size={20} /></div>
              <ArrowRight size={14} className="tile-arrow" />
            </div>
            <div className="mt-2">
              <div className="tile-title">{q.title}</div>
              <div className="tile-desc">{q.desc}</div>
            </div>
          </Link>
        ))}
      </section>

      {/* Daily tip */}
      <section className="mb-8 fade-up">
        <div className="edition-tag mb-3">Dica do dia · IA</div>
        <div className="surface p-5">
          {tip ? (
            <div>
              <div className="text-2xl">{tip.icon}</div>
              <p className="mt-2 text-[15px] leading-relaxed">{tip.tip}</p>
              <div className="mt-3 text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>{tip.category}</div>
            </div>
          ) : (
            <div className="text-sm" style={{ color: "var(--n-500)" }}>
              Receba uma dica personalizada para {active?.name}.
            </div>
          )}
          <button onClick={loadTip} disabled={loadingTip || !active} className="btn-primary mt-4">
            <Sparkles size={14} /> {loadingTip ? "Gerando…" : tip ? "Nova dica" : "Gerar dica"}
          </button>
        </div>
      </section>

      <p className="mb-6 text-xs" style={{ color: "var(--n-500)" }}>
        ⚠️ Este app não substitui consulta veterinária. Em emergências, procure um veterinário imediatamente.
      </p>
    </AppShell>
  );
}

function Stat({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--n-500)" }}>
        <span>{icon}</span> {label}
      </div>
      <div className="mt-1 truncate text-base font-semibold">{value}</div>
      <div className="text-[11px]" style={{ color: "var(--n-500)" }}>{sub}</div>
    </div>
  );
}
