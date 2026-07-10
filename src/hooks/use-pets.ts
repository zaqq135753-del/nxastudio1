import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listPets } from "@/lib/pet.functions";

const KEY = "petia:activePetId";

export type Pet = {
  id: string;
  name: string;
  type: "dog" | "cat" | "other";
  breed: string | null;
  birth_date: string | null;
  gender: "male" | "female" | "unknown" | null;
  weight: number | null;
  photo_url: string | null;
  microchip: string | null;
  neutered: boolean | null;
  notes: string | null;
  created_at: string;
};

export function usePets() {
  const [pets, setPets] = useState<Pet[] | null>(null);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const fetchPets = useServerFn(listPets);

  const refresh = useCallback(async () => {
    const rows = (await fetchPets()) as Pet[];
    setPets(rows);
    const stored = localStorage.getItem(KEY);
    const current = stored && rows.find((p) => p.id === stored) ? stored : rows[0]?.id ?? null;
    setActiveIdState(current);
    if (current) localStorage.setItem(KEY, current);
    return rows;
  }, [fetchPets]);

  useEffect(() => { refresh(); }, [refresh]);

  const setActiveId = (id: string) => {
    localStorage.setItem(KEY, id);
    setActiveIdState(id);
  };

  const active = pets?.find((p) => p.id === activeId) ?? null;
  return { pets, active, activeId, setActiveId, refresh };
}

export function petAgeLabel(birth: string | null | undefined): string {
  if (!birth) return "idade —";
  const months = Math.floor((Date.now() - new Date(birth).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 1) return "recém-nascido";
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} ${years === 1 ? "ano" : "anos"}` : `${years}a ${rest}m`;
}

export function petEmoji(type: string): string {
  return type === "cat" ? "🐱" : type === "dog" ? "🐶" : "🐾";
}
