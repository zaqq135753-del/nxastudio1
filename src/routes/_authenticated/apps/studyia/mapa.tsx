import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { generateNatalChart, getCosmosProfile, type NatalChart } from "@/lib/cosmos.functions";
import { Stars } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/studyia/mapa")({
  component: MapaPage,
});

function MapaPage() {
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const gen = useServerFn(generateNatalChart);
  const getP = useServerFn(getCosmosProfile);

  useEffect(() => {
    getP().then((p) => {
      const prof = p as { chart?: NatalChart; birth_date?: string } | null;
      setHasProfile(!!prof?.birth_date);
      if (prof?.chart) setChart(prof.chart);
    });
  }, [getP]);

  async function generate() {
    setLoading(true);
    try { setChart(await gen()); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader title="Mapa astral" subtitle="Sol, Lua, Ascendente e casas principais." />

      {!hasProfile ? (
        <div className="surface p-5 text-sm" style={{ color: "var(--n-500)" }}>
          Complete seu perfil astrológico primeiro (aba Perfil).
        </div>
      ) : (
        <>
          <button onClick={generate} disabled={loading} className="btn-primary mb-4">
            <Stars size={14} /> {loading ? "Consultando os astros…" : chart ? "Regenerar mapa" : "Gerar meu mapa"}
          </button>

          {chart && (
            <div className="fade-up space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Chip label="☉ Sol" value={chart.sun_sign} />
                <Chip label="☾ Lua" value={chart.moon_sign} />
                <Chip label="↑ Ascendente" value={chart.rising_sign} />
              </div>

              <div className="surface p-5">
                <div className="edition-tag mb-2">Resumo</div>
                <p className="text-sm">{chart.summary}</p>
              </div>

              <div className="surface p-5">
                <div className="edition-tag mb-2">Personalidade</div>
                <p className="text-sm">{chart.personality}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="surface p-5">
                  <div className="edition-tag mb-2">✨ Pontos fortes</div>
                  <ul className="space-y-1 text-sm">{chart.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                </div>
                <div className="surface p-5">
                  <div className="edition-tag mb-2">⚠️ Desafios</div>
                  <ul className="space-y-1 text-sm">{chart.challenges.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                </div>
              </div>

              <div className="surface p-5">
                <div className="edition-tag mb-2">🎯 Propósito de vida</div>
                <p className="text-sm">{chart.life_purpose}</p>
              </div>

              {chart.houses?.length > 0 && (
                <div className="space-y-2">
                  <div className="edition-tag mb-1">Casas astrológicas</div>
                  {chart.houses.map((h) => (
                    <div key={h.house} className="surface p-4">
                      <div className="text-xs font-semibold uppercase" style={{ color: "var(--c-orange)" }}>
                        Casa {h.house} · {h.theme}
                      </div>
                      <p className="mt-1 text-sm">{h.interpretation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-3 text-center">
      <div className="text-xs" style={{ color: "var(--n-500)" }}>{label}</div>
      <div className="text-sm font-semibold capitalize">{value}</div>
    </div>
  );
}
