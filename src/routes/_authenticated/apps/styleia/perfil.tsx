import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { getStyleProfile, upsertStyleProfile } from "@/lib/style.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/styleia/perfil")({
  component: Perfil,
});

const BODY = ["Retângulo", "Ampulheta", "Pêra", "Triângulo invertido", "Oval"];
const STYLES = ["Minimalista", "Clássico", "Boho", "Streetwear", "Romântico", "Esportivo", "Elegante"];
const OCCS = ["Trabalho", "Casual", "Balada", "Formal", "Esporte"];

function Perfil() {
  const [f, setF] = useState({ body_type: "", style_words: [] as string[], colors_favorite: "", colors_avoid: "", occasions: [] as string[], budget: "médio", notes: "" });
  const get = useServerFn(getStyleProfile);
  const save = useServerFn(upsertStyleProfile);

  useEffect(() => {
    get().then((p) => {
      if (!p) return;
      setF({
        body_type: p.body_type ?? "",
        style_words: p.style_words ?? [],
        colors_favorite: (p.colors_favorite ?? []).join(", "),
        colors_avoid: (p.colors_avoid ?? []).join(", "),
        occasions: p.occasions ?? [],
        budget: p.budget ?? "médio",
        notes: p.notes ?? "",
      });
    });
  }, [get]);

  function toggle(k: "style_words" | "occasions", v: string) {
    setF((prev) => ({
      ...prev,
      [k]: prev[k].includes(v) ? prev[k].filter((x) => x !== v) : [...prev[k], v],
    }));
  }

  async function submit() {
    await save({
      data: {
        body_type: f.body_type,
        style_words: f.style_words,
        colors_favorite: f.colors_favorite.split(",").map((s) => s.trim()).filter(Boolean),
        colors_avoid: f.colors_avoid.split(",").map((s) => s.trim()).filter(Boolean),
        occasions: f.occasions,
        budget: f.budget,
        notes: f.notes,
      },
    });
    toast.success("Perfil salvo");
  }

  return (
    <AppShell appSlug="styleia">
      <ScreenHeader title="Perfil de estilo" subtitle="Quanto mais completo, melhor a IA acerta." />

      <div className="surface space-y-5 p-5">
        <Field label="Tipo de corpo">
          <div className="flex flex-wrap gap-2">
            {BODY.map((b) => (
              <button key={b} onClick={() => setF({ ...f, body_type: b })} className="chip"
                style={{ background: f.body_type === b ? "var(--c-orange)" : "var(--n-100)", color: f.body_type === b ? "#fff" : "var(--n-700)" }}>{b}</button>
            ))}
          </div>
        </Field>

        <Field label="Palavras que definem seu estilo">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button key={s} onClick={() => toggle("style_words", s)} className="chip"
                style={{ background: f.style_words.includes(s) ? "var(--c-orange)" : "var(--n-100)", color: f.style_words.includes(s) ? "#fff" : "var(--n-700)" }}>{s}</button>
            ))}
          </div>
        </Field>

        <Field label="Cores favoritas (separadas por vírgula)">
          <input value={f.colors_favorite} onChange={(e) => setF({ ...f, colors_favorite: e.target.value })} className="input-field w-full" placeholder="preto, bege, azul-marinho" />
        </Field>

        <Field label="Cores que evita">
          <input value={f.colors_avoid} onChange={(e) => setF({ ...f, colors_avoid: e.target.value })} className="input-field w-full" placeholder="amarelo, rosa neon" />
        </Field>

        <Field label="Ocasiões mais frequentes">
          <div className="flex flex-wrap gap-2">
            {OCCS.map((o) => (
              <button key={o} onClick={() => toggle("occasions", o)} className="chip"
                style={{ background: f.occasions.includes(o) ? "var(--c-orange)" : "var(--n-100)", color: f.occasions.includes(o) ? "#fff" : "var(--n-700)" }}>{o}</button>
            ))}
          </div>
        </Field>

        <Field label="Orçamento">
          <div className="flex gap-2">
            {["baixo", "médio", "alto"].map((b) => (
              <button key={b} onClick={() => setF({ ...f, budget: b })} className="chip"
                style={{ background: f.budget === b ? "var(--c-orange)" : "var(--n-100)", color: f.budget === b ? "#fff" : "var(--n-700)" }}>{b}</button>
            ))}
          </div>
        </Field>

        <Field label="Observações">
          <textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className="input-field w-full" rows={3} placeholder="Ex: prefiro tecidos leves, uso PP em cima..." />
        </Field>

        <button onClick={submit} className="btn-primary">Salvar perfil</button>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase" style={{ color: "var(--n-500)" }}>{label}</div>
      {children}
    </div>
  );
}
