import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { getLangProfile, upsertLangProfile, LANGS } from "@/lib/fluency.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/fluencyia/perfil")({
  component: PerfilPage,
});

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function PerfilPage() {
  const [lang, setLang] = useState("en");
  const [level, setLevel] = useState("A1");
  const [goal, setGoal] = useState(15);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useServerFn(getLangProfile);
  const save = useServerFn(upsertLangProfile);

  useEffect(() => {
    fetchProfile().then((p) => {
      const prof = p as { target_lang?: string; level?: string; daily_goal_min?: number } | null;
      if (prof) {
        setLang(prof.target_lang ?? "en");
        setLevel(prof.level ?? "A1");
        setGoal(prof.daily_goal_min ?? 15);
      }
    });
  }, [fetchProfile]);

  async function submit() {
    setSaving(true);
    try {
      await save({ data: { target_lang: lang, level, daily_goal_min: goal } });
      toast.success("Perfil salvo");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setSaving(false); }
  }

  return (
    <AppShell appSlug="fluencyia">
      <ScreenHeader title="Perfil de aprendizado" subtitle="Ajuste idioma, nível e meta diária." />

      <div className="surface p-5 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>Idioma</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="input-field mt-1 w-full">
            {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>Nível (CEFR)</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)}
                className="chip"
                style={{ background: level === l ? "var(--c-orange)" : "var(--n-100)", color: level === l ? "#fff" : undefined }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "var(--n-500)" }}>Meta diária (minutos)</label>
          <input type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value))}
            min={5} max={120} className="input-field mt-1 w-32" />
        </div>

        <button onClick={submit} disabled={saving} className="btn-primary">
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </AppShell>
  );
}
