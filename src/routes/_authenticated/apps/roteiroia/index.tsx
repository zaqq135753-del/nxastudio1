import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { listItineraries, featuredDestinations } from "@/lib/travel.functions";
import { Plane, MapPin, Compass, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/apps/roteiroia/")({
  component: RoteiroHome,
});

type ItineraryRow = { id: string; destination: string; days: unknown[]; start_date: string | null };
type Destination = { name: string; country: string; tag: string; tip: string };

const quick = [
  { to: "/apps/roteiroia/criar" as const, icon: Plane, title: "Criar roteiro", desc: "Planeje sua próxima viagem" },
  { to: "/apps/roteiroia/meus" as const, icon: MapPin, title: "Minhas viagens", desc: "Seus roteiros salvos" },
  { to: "/apps/roteiroia/chat" as const, icon: Compass, title: "Consultor IA", desc: "Pergunte qualquer coisa" },
];

function RoteiroHome() {
  const [saved, setSaved] = useState<ItineraryRow[]>([]);
  const [featured, setFeatured] = useState<Destination[]>([]);
  const list = useServerFn(listItineraries);
  const feat = useServerFn(featuredDestinations);

  useEffect(() => {
    list().then((r) => setSaved((r as ItineraryRow[]).slice(0, 3)));
    feat().then((r) => setFeatured(r as Destination[]));
  }, [list, feat]);

  return (
    <AppShell appSlug="roteiroia">
      <ScreenHeader title="✈️ RoteiroIA" subtitle="Roteiros de viagem sob medida com IA." />

      <section className="stagger grid grid-cols-1 gap-3 sm:grid-cols-3">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="tile-hero">
            <div className="flex items-start justify-between">
              <div className="tile-icon-wrap"><q.icon size={20} /></div>
              <ArrowRight size={14} className="tile-arrow" />
            </div>
            <div className="mt-3">
              <div className="tile-title">{q.title}</div>
              <div className="tile-desc">{q.desc}</div>
            </div>
          </Link>
        ))}
      </section>

      {saved.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="edition-tag">Roteiros recentes</div>
            <Link to="/apps/roteiroia/meus" className="text-xs" style={{ color: "var(--c-orange)" }}>Ver todos →</Link>
          </div>
          <div className="space-y-2">
            {saved.map((s) => (
              <Link key={s.id} to="/apps/roteiroia/meus" className="surface flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{s.destination}</div>
                  <div className="text-xs" style={{ color: "var(--n-500)" }}>
                    {s.days?.length ?? 0} dias {s.start_date ? `· ${new Date(s.start_date).toLocaleDateString("pt-BR")}` : ""}
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: "var(--n-500)" }} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="edition-tag mb-3">Destinos em alta</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {featured.map((d) => (
            <div key={d.name} className="surface p-4">
              <div className="text-xs uppercase" style={{ color: "var(--c-orange)" }}>{d.tag}</div>
              <div className="mt-1 font-semibold">{d.name}</div>
              <div className="text-xs" style={{ color: "var(--n-500)" }}>{d.country}</div>
              <div className="mt-2 text-xs" style={{ color: "var(--n-500)" }}>📅 {d.tip}</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
