import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { getCosmosProfile, upsertCosmosProfile } from "@/lib/cosmos.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/studyia/perfil")({
  component: Perfil,
});

function Perfil() {
  const [f, setF] = useState({ birth_date: "", birth_time: "", birth_place: "" });
  const [sun, setSun] = useState<string | null>(null);
  const get = useServerFn(getCosmosProfile);
  const save = useServerFn(upsertCosmosProfile);

  useEffect(() => {
    get().then((p) => {
      const prof = p as { birth_date?: string; birth_time?: string; birth_place?: string; sun_sign?: string } | null;
      if (!prof) return;
      setF({
        birth_date: prof.birth_date ?? "",
        birth_time: prof.birth_time ?? "",
        birth_place: prof.birth_place ?? "",
      });
      setSun(prof.sun_sign ?? null);
    });
  }, [get]);

  async function submit() {
    if (!f.birth_date) return toast.error("Informe sua data de nascimento.");
    try {
      const saved = await save({ data: f });
      const s = saved as { sun_sign?: string } | null;
      setSun(s?.sun_sign ?? null);
      toast.success("Perfil salvo");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
  }

  return (
    <AppShell appSlug="cosmosia">
      <ScreenHeader title="Perfil astrológico" subtitle="Data, hora e local de nascimento pra calcular seu mapa." />

      <div className="surface space-y-4 p-5">
        <div>
          <div className="mb-1 text-xs uppercase" style={{ color: "var(--n-500)" }}>Data de nascimento *</div>
          <input type="date" value={f.birth_date} onChange={(e) => setF({ ...f, birth_date: e.target.value })} className="input-field w-full" />
        </div>
        <div>
          <div className="mb-1 text-xs uppercase" style={{ color: "var(--n-500)" }}>Hora (opcional, mas melhora precisão)</div>
          <input type="time" value={f.birth_time} onChange={(e) => setF({ ...f, birth_time: e.target.value })} className="input-field w-full" />
        </div>
        <div>
          <div className="mb-1 text-xs uppercase" style={{ color: "var(--n-500)" }}>Local (cidade, país)</div>
          <input value={f.birth_place} onChange={(e) => setF({ ...f, birth_place: e.target.value })} placeholder="São Paulo, Brasil" className="input-field w-full" />
        </div>
        <button onClick={submit} className="btn-primary">Salvar perfil</button>

        {sun && (
          <div className="rounded-xl p-3 text-sm" style={{ background: "var(--n-100)" }}>
            Seu signo solar: <b className="capitalize">{sun}</b>
          </div>
        )}
      </div>
    </AppShell>
  );
}
