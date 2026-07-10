import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, ScreenHeader } from "@/components/layout/AppShell";
import { usePets, petAgeLabel, petEmoji, type Pet } from "@/hooks/use-pets";
import { upsertPet, deletePet } from "@/lib/pet.functions";
import { Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/apps/petia/perfil")({
  component: PerfilPage,
});

type Form = {
  id?: string;
  name: string;
  type: "dog" | "cat" | "other";
  breed: string;
  birth_date: string;
  gender: "male" | "female" | "unknown";
  weight: string;
  photo_url: string;
  microchip: string;
  neutered: boolean;
};

const EMPTY: Form = {
  name: "", type: "dog", breed: "", birth_date: "",
  gender: "unknown", weight: "", photo_url: "", microchip: "", neutered: false,
};

function PerfilPage() {
  const { pets, active, setActiveId, refresh } = usePets();
  const [editing, setEditing] = useState<Form | null>(null);

  const save = useServerFn(upsertPet);
  const del = useServerFn(deletePet);

  function startEdit(p: Pet | null) {
    if (!p) return setEditing({ ...EMPTY });
    setEditing({
      id: p.id, name: p.name, type: p.type, breed: p.breed ?? "",
      birth_date: p.birth_date ?? "", gender: (p.gender ?? "unknown") as Form["gender"],
      weight: p.weight?.toString() ?? "", photo_url: p.photo_url ?? "",
      microchip: p.microchip ?? "", neutered: p.neutered ?? false,
    });
  }

  async function submit() {
    if (!editing?.name.trim()) return toast.error("Informe o nome");
    const w = parseFloat(editing.weight);
    const saved = await save({ data: {
      id: editing.id, name: editing.name, type: editing.type,
      breed: editing.breed || undefined, birth_date: editing.birth_date || undefined,
      gender: editing.gender, weight: isNaN(w) ? undefined : w,
      photo_url: editing.photo_url || undefined, microchip: editing.microchip || undefined,
      neutered: editing.neutered,
    }}) as Pet | null;
    await refresh();
    if (saved?.id) setActiveId(saved.id);
    setEditing(null);
    toast.success("Pet salvo");
  }

  async function remove(id: string) {
    if (!confirm("Remover este pet e todos os registros?")) return;
    await del({ data: { id } });
    await refresh();
    toast.success("Pet removido");
  }

  return (
    <AppShell appSlug="petia">
      <ScreenHeader title="Perfil" subtitle="Seus pets, dados e configurações." />

      {editing ? (
        <section className="surface p-5 fade-up mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">{editing.id ? "Editar pet" : "Novo pet"}</h3>
            <button onClick={() => setEditing(null)} className="chip chip-neutral"><X size={12} /></button>
          </div>
          <div className="space-y-3">
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Nome" className="input-field" />
            <div className="grid grid-cols-2 gap-2">
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as Form["type"] })} className="input-field">
                <option value="dog">🐶 Cão</option><option value="cat">🐱 Gato</option><option value="other">🐾 Outro</option>
              </select>
              <select value={editing.gender} onChange={(e) => setEditing({ ...editing, gender: e.target.value as Form["gender"] })} className="input-field">
                <option value="unknown">Sexo</option><option value="male">Macho</option><option value="female">Fêmea</option>
              </select>
            </div>
            <input value={editing.breed} onChange={(e) => setEditing({ ...editing, breed: e.target.value })}
              placeholder="Raça (ex.: Labrador)" className="input-field" />
            <div className="grid grid-cols-2 gap-2">
              <input value={editing.birth_date} onChange={(e) => setEditing({ ...editing, birth_date: e.target.value })}
                type="date" placeholder="Nascimento" className="input-field" />
              <input value={editing.weight} onChange={(e) => setEditing({ ...editing, weight: e.target.value })}
                type="number" step="0.1" placeholder="Peso (kg)" className="input-field" />
            </div>
            <input value={editing.photo_url} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })}
              placeholder="URL da foto (opcional)" className="input-field" />
            <input value={editing.microchip} onChange={(e) => setEditing({ ...editing, microchip: e.target.value })}
              placeholder="Microchip (opcional)" className="input-field" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.neutered}
                onChange={(e) => setEditing({ ...editing, neutered: e.target.checked })} />
              Castrado
            </label>
            <button onClick={submit} className="btn-primary w-full"><Save size={14} /> Salvar</button>
          </div>
        </section>
      ) : (
        <button onClick={() => startEdit(null)} className="btn-primary mb-6">
          <Plus size={14} /> Adicionar pet
        </button>
      )}

      <section className="space-y-3">
        {(pets ?? []).map((p) => (
          <div key={p.id} className="surface p-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl overflow-hidden" style={{ background: "var(--n-100)" }}>
              {p.photo_url ? <img src={p.photo_url} alt="" className="h-full w-full object-cover" /> : petEmoji(p.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{p.name} {active?.id === p.id && <span className="chip chip-neutral ml-1 text-[10px]">Ativo</span>}</div>
              <div className="text-xs" style={{ color: "var(--n-500)" }}>
                {p.breed ?? "SRD"} · {petAgeLabel(p.birth_date)} · {p.weight ?? "?"} kg
              </div>
            </div>
            <div className="flex gap-1">
              {active?.id !== p.id && (
                <button onClick={() => setActiveId(p.id)} className="chip chip-neutral">Selecionar</button>
              )}
              <button onClick={() => startEdit(p)} className="chip chip-neutral">Editar</button>
              <button onClick={() => remove(p.id)} className="chip chip-neutral"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
        {pets && pets.length === 0 && (
          <div className="text-sm text-center py-8" style={{ color: "var(--n-500)" }}>Nenhum pet cadastrado ainda.</div>
        )}
      </section>

      <p className="mt-8 text-xs" style={{ color: "var(--n-500)" }}>
        ⚠️ Este app não substitui consulta veterinária. Em emergências, procure um veterinário imediatamente.
      </p>
    </AppShell>
  );
}
