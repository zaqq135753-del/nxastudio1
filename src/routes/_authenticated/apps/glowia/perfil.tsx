import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { getSkinProfile, upsertSkinProfile } from "@/lib/glow.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/glowia/perfil")({
  component: PerfilPage,
});

const TYPES = ["Oleosa", "Seca", "Mista", "Normal", "Sensível"];
const CONCERNS = ["Acne", "Manchas", "Rugas", "Poros dilatados", "Oleosidade", "Ressecamento", "Sensibilidade"];

function PerfilPage() {
  const [type, setType] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [climate, setClimate] = useState("");
  const [saving, setSaving] = useState(false);

  const fetch = useServerFn(getSkinProfile);
  const save = useServerFn(upsertSkinProfile);

  useEffect(() => {
    fetch().then((p) => {
      const prof = p as { skin_type?: string; concerns?: string[]; allergies?: string[]; age?: number; climate?: string } | null;
      if (!prof) return;
      setType(prof.skin_type ?? "");
      setConcerns(prof.concerns ?? []);
      setAllergies((prof.allergies ?? []).join(", "));
      setAge(prof.age ?? "");
      setClimate(prof.climate ?? "");
    });
  }, [fetch]);

  async function submit() {
    setSaving(true);
    try {
      await save({ data: {
        skin_type: type, concerns,
        allergies: allergies.split(",").map((s) => s.trim()).filter(Boolean),
        age: typeof age === "number" ? age : undefined, climate,
      }});
      toast.success("Perfil salvo");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setSaving(false); }
  }

  function toggle(c: string) {
    setConcerns((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  return (
    <AppShell appSlug="glowia">
      <ScreenHeader title="Perfil de pele" subtitle="Quanto mais completo, mais precisas as recomendações." />

      <div className="surface p-5 space-y-4">
        <Field label="Tipo de pele">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setType(t)} className="chip"
                style={{ background: type === t ? "var(--c-orange)" : "var(--n-100)", color: type === t ? "#fff" : undefined }}>{t}</button>
            ))}
          </div>
        </Field>

        <Field label="Preocupações">
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map((c) => (
              <button key={c} onClick={() => toggle(c)} className="chip"
                style={{ background: concerns.includes(c) ? "var(--c-orange)" : "var(--n-100)", color: concerns.includes(c) ? "#fff" : undefined }}>{c}</button>
            ))}
          </div>
        </Field>

        <Field label="Alergias / ingredientes a evitar (separe por vírgula)">
          <input value={allergies} onChange={(e) => setAllergies(e.target.value)} className="input-field w-full" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Idade">
            <input type="number" value={age} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
              className="input-field w-full" />
          </Field>
          <Field label="Clima">
            <input value={climate} onChange={(e) => setClimate(e.target.value)} placeholder="Ex.: úmido, seco, frio"
              className="input-field w-full" />
          </Field>
        </div>

        <button onClick={submit} disabled={saving} className="btn-primary">
          {saving ? "Salvando…" : "Salvar perfil"}
        </button>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--n-500)" }}>{label}</div>
      {children}
    </div>
  );
}
