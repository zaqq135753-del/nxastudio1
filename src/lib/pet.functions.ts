import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL, type ChatMessage } from "./ai-shared";


// ---------- Types ----------
export type DailyTip = {
  tip: string;
  category: "nutrition" | "exercise" | "health" | "grooming" | "behavior";
  icon: string;
};

export type VetChatReply = {
  reply: string;
  urgency: "green" | "yellow" | "red";
  urgencyLabel: string;
  suggestions?: string[];
};

export type FoodPlan = {
  dailyCalories: number;
  meals: { time: string; type: string; amount: string; notes?: string }[];
  allowedTreats: string[];
  forbiddenFoods: string[];
  tips: string[];
};

export type TrainingPlan = {
  title: string;
  duration: string;
  understanding: string;
  steps: { week: number; focus: string; exercises: string[]; tips: string[] }[];
  donts: string[];
  whenToSeekHelp: string;
};

export type HealthReport = {
  summary: string;
  weightAnalysis: string;
  vaccinationStatus: string;
  concerns: string[];
  recommendations: string[];
};

// ---------- Helpers ----------
function petSummary(pet: {
  name: string; type: string; breed?: string | null;
  birth_date?: string | null; weight?: number | null; neutered?: boolean | null;
}) {
  const ageMonths = pet.birth_date
    ? Math.max(0, Math.floor((Date.now() - new Date(pet.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
    : null;
  return {
    name: pet.name,
    type: pet.type === "dog" ? "cão" : pet.type === "cat" ? "gato" : pet.type,
    breed: pet.breed ?? "SRD",
    ageMonths,
    weight: pet.weight ?? null,
    neutered: pet.neutered ?? false,
  };
}

// ---------- Pets CRUD ----------
export const listPets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("pets").select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const upsertPet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string; name: string; type: "dog" | "cat" | "other";
    breed?: string; birth_date?: string; gender?: "male" | "female" | "unknown";
    weight?: number; photo_url?: string; microchip?: string; neutered?: boolean;
  }) => d)
  .handler(async ({ data, context }) => {
    const payload = { ...data, user_id: context.userId };
    const { data: saved, error } = data.id
      ? await context.supabase.from("pets").update(payload).eq("id", data.id).eq("user_id", context.userId).select().maybeSingle()
      : await context.supabase.from("pets").insert(payload).select().maybeSingle();
    if (error) throw error;
    return saved;
  });

export const deletePet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pets").delete()
      .eq("id", data.id).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Daily tip ----------
export const dailyTip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: pet } = await context.supabase.from("pets").select("*")
      .eq("id", data.petId).eq("user_id", context.userId).maybeSingle();
    if (!pet) throw new Error("Pet não encontrado");
    const p = petSummary(pet);
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um veterinário brasileiro. Gere UMA dica prática, específica para raça/idade, executável hoje, máximo 2 frases. Responda APENAS em JSON: {"tip":"...","category":"nutrition|exercise|health|grooming|behavior","icon":"emoji"}` },
        { role: "user", content: `Pet: ${p.name} (${p.type})\nRaça: ${p.breed}\nIdade: ${p.ageMonths ?? "?"} meses\nPeso: ${p.weight ?? "?"} kg` },
      ],
      temperature: 0.85, max_tokens: 300,
    });
    const tip = parseJson<DailyTip>(raw);
    await context.supabase.from("pet_plans").insert({
      pet_id: data.petId, user_id: context.userId,
      kind: "daily_tip", title: tip.category, payload: tip,
    });
    return tip;
  });

// ---------- Vet chat ----------
export const vetChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string; message: string; history: ChatMessage[] }) => d)
  .handler(async ({ data, context }) => {
    const { data: pet } = await context.supabase.from("pets").select("*")
      .eq("id", data.petId).eq("user_id", context.userId).maybeSingle();
    if (!pet) throw new Error("Pet não encontrado");
    const p = petSummary(pet);

    await context.supabase.from("pet_chat_messages").insert({
      pet_id: data.petId, user_id: context.userId, role: "user", content: data.message,
    });

    const system = `Você é um veterinário brasileiro especializado em cães e gatos.
Pet: ${p.name} (${p.type}), raça ${p.breed}, ${p.ageMonths ?? "?"} meses, ${p.weight ?? "?"} kg, castrado: ${p.neutered ? "sim" : "não"}.

Regras:
- NUNCA diagnostique com certeza.
- Use linguagem simples, seja empático.
- Baseie-se em evidências veterinárias.
- Máximo 250 palavras.
- Para sintomas descritos, classifique urgência: green (observar em casa), yellow (vet em 24h), red (emergência imediata).
- Sinais de emergência: dificuldade respiratória, convulsões, sangramento intenso, vômito com sangue, não urina há 24h+, apatia extrema, ingestão de tóxicos.

Responda APENAS em JSON válido:
{"reply":"texto da resposta em pt-BR","urgency":"green|yellow|red","urgencyLabel":"frase curta ex.: Pode observar em casa","suggestions":["pergunta rápida 1","pergunta rápida 2"]}`;

    const messages: ChatMessage[] = [
      { role: "system", content: system },
      ...data.history.slice(-10),
      { role: "user", content: data.message },
    ];
    const raw = await callGateway({
      model: TEXT_MODEL, messages, temperature: 0.6, max_tokens: 1200,
    });
    const parsed = parseJson<VetChatReply>(raw);

    await context.supabase.from("pet_chat_messages").insert({
      pet_id: data.petId, user_id: context.userId,
      role: "assistant", content: parsed.reply, urgency: parsed.urgency,
    });
    return parsed;
  });

export const listChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.from("pet_chat_messages")
      .select("id, role, content, urgency, created_at")
      .eq("pet_id", data.petId).eq("user_id", context.userId)
      .order("created_at", { ascending: true }).limit(200);
    if (error) throw error;
    return rows ?? [];
  });

export const clearChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("pet_chat_messages").delete()
      .eq("pet_id", data.petId).eq("user_id", context.userId);
    return { ok: true };
  });

// ---------- Health ----------
export const addHealthRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string; weight?: number; notes?: string; record_date?: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pet_health_records").insert({
      pet_id: data.petId, user_id: context.userId,
      weight: data.weight, notes: data.notes,
      record_date: data.record_date ?? new Date().toISOString().slice(0, 10),
    });
    if (error) throw error;
    if (data.weight) {
      await context.supabase.from("pets").update({ weight: data.weight })
        .eq("id", data.petId).eq("user_id", context.userId);
    }
    return { ok: true };
  });

export const listHealth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase.from("pet_health_records")
      .select("*").eq("pet_id", data.petId).eq("user_id", context.userId)
      .order("record_date", { ascending: false }).limit(100);
    return rows ?? [];
  });

export const addVaccination = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string; name: string; applied_on: string; next_booster?: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pet_vaccinations").insert({
      pet_id: data.petId, user_id: context.userId,
      name: data.name, applied_on: data.applied_on,
      next_booster: data.next_booster, notes: data.notes,
    });
    if (error) throw error;
    return { ok: true };
  });

export const listVaccinations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase.from("pet_vaccinations")
      .select("*").eq("pet_id", data.petId).eq("user_id", context.userId)
      .order("applied_on", { ascending: false });
    return rows ?? [];
  });

export const healthReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: pet } = await context.supabase.from("pets").select("*")
      .eq("id", data.petId).eq("user_id", context.userId).maybeSingle();
    if (!pet) throw new Error("Pet não encontrado");
    const [{ data: health }, { data: vacs }] = await Promise.all([
      context.supabase.from("pet_health_records").select("*").eq("pet_id", data.petId).order("record_date", { ascending: false }).limit(20),
      context.supabase.from("pet_vaccinations").select("*").eq("pet_id", data.petId).order("applied_on", { ascending: false }).limit(20),
    ]);
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um veterinário brasileiro compilando um relatório para outro veterinário. Responda APENAS em JSON: {"summary":"...","weightAnalysis":"...","vaccinationStatus":"...","concerns":["..."],"recommendations":["..."]}` },
        { role: "user", content: `Pet: ${JSON.stringify(petSummary(pet))}\nPeso: ${JSON.stringify(health ?? [])}\nVacinas: ${JSON.stringify(vacs ?? [])}` },
      ],
      temperature: 0.5, max_tokens: 1500,
    });
    const report = parseJson<HealthReport>(raw);
    await context.supabase.from("pet_plans").insert({
      pet_id: data.petId, user_id: context.userId,
      kind: "health_report", title: "Relatório veterinário", payload: report,
    });
    return report;
  });

// ---------- Food ----------
export const foodPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string; activityLevel: "low" | "medium" | "high"; healthConditions?: string[] }) => d)
  .handler(async ({ data, context }) => {
    const { data: pet } = await context.supabase.from("pets").select("*")
      .eq("id", data.petId).eq("user_id", context.userId).maybeSingle();
    if (!pet) throw new Error("Pet não encontrado");
    const p = petSummary(pet);
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um nutricionista veterinário brasileiro. Crie um plano alimentar. Responda APENAS em JSON: {"dailyCalories":500,"meals":[{"time":"08:00","type":"Ração seca","amount":"150g","notes":"opcional"}],"allowedTreats":["..."],"forbiddenFoods":["..."],"tips":["..."]}` },
        { role: "user", content: `Pet: ${p.name} (${p.type}, ${p.breed})\nPeso: ${p.weight ?? "?"} kg\nIdade: ${p.ageMonths ?? "?"} meses\nAtividade: ${data.activityLevel}\nCondições: ${(data.healthConditions ?? []).join(", ") || "nenhuma"}` },
      ],
      temperature: 0.6, max_tokens: 1500,
    });
    const plan = parseJson<FoodPlan>(raw);
    await context.supabase.from("pet_plans").insert({
      pet_id: data.petId, user_id: context.userId,
      kind: "food", title: `Plano alimentar · ${p.name}`, payload: plan,
    });
    return plan;
  });

export const addMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string; type: string; amount?: string; meal_time?: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pet_meals").insert({
      pet_id: data.petId, user_id: context.userId,
      type: data.type, amount: data.amount, meal_time: data.meal_time, notes: data.notes,
    });
    if (error) throw error;
    return { ok: true };
  });

export const listMeals = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase.from("pet_meals")
      .select("*").eq("pet_id", data.petId).eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(50);
    return rows ?? [];
  });

// ---------- Training ----------
export const trainingPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string; behaviorIssue: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: pet } = await context.supabase.from("pets").select("*")
      .eq("id", data.petId).eq("user_id", context.userId).maybeSingle();
    if (!pet) throw new Error("Pet não encontrado");
    const p = petSummary(pet);
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um adestrador brasileiro especializado em cães e gatos. Crie um plano de treino de 4 semanas com reforço positivo. Responda APENAS em JSON: {"title":"...","duration":"4 semanas","understanding":"...","steps":[{"week":1,"focus":"...","exercises":["..."],"tips":["..."]}],"donts":["..."],"whenToSeekHelp":"..."}` },
        { role: "user", content: `Problema: ${data.behaviorIssue}\nPet: ${p.type} · ${p.breed}\nIdade: ${p.ageMonths ?? "?"} meses` },
      ],
      temperature: 0.7, max_tokens: 2000,
    });
    const plan = parseJson<TrainingPlan>(raw);
    await context.supabase.from("pet_plans").insert({
      pet_id: data.petId, user_id: context.userId,
      kind: "training", title: data.behaviorIssue, payload: plan,
    });
    return plan;
  });

export const listPlans = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { petId: string; kind?: string }) => d)
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("pet_plans")
      .select("id, kind, title, payload, created_at")
      .eq("pet_id", data.petId).eq("user_id", context.userId);
    if (data.kind) q = q.eq("kind", data.kind);
    const { data: rows } = await q.order("created_at", { ascending: false }).limit(20);
    return rows ?? [];
  });

/* =============== Symptom Triage =============== */
export type TriageResult = {
  urgency: "emergency" | "urgent" | "monitor" | "routine";
  urgency_label: string;
  reasoning: string;
  next_steps: string[];
  home_care: string[];
  when_to_vet: string;
};

const URGENCY_LABEL: Record<TriageResult["urgency"], string> = {
  emergency: "🚨 Emergência — ao vet AGORA",
  urgent: "⚠️ Urgente — hoje/24h",
  monitor: "👀 Monitorar 24-48h",
  routine: "✅ Rotina — pode agendar",
};

export const symptomTriage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pet_id?: string; species: string; age?: string; symptoms: string[]; notes?: string }) => d)
  .handler(async ({ data }): Promise<TriageResult> => {
    const prompt = `Espécie: ${data.species}. Idade: ${data.age ?? "n/i"}.
Sintomas: ${data.symptoms.join("; ")}.
Notas: ${data.notes ?? "—"}.

Responda APENAS JSON com triagem:
{
  "urgency": "emergency|urgent|monitor|routine",
  "reasoning": "por que esse nível (1-2 frases, tom calmo e claro)",
  "next_steps": ["passo 1", "passo 2", "passo 3"],
  "home_care": ["cuidado em casa 1"],
  "when_to_vet": "sinais para procurar o vet imediatamente"
}
Regras: sangramento intenso, dispneia, convulsão, distensão abdominal, envenenamento suspeito, trauma grave, olho fechado com secreção → emergency. Vômito/diarreia >24h, apatia forte, mancar sem apoiar → urgent.`;

    const raw = await callGateway({
      model: TEXT_MODEL, max_tokens: 1200,
      messages: [
        { role: "system", content: "Você é uma IA de triagem veterinária. Nunca substitui o vet, mas orienta rapidamente. Responda APENAS JSON válido." },
        { role: "user", content: prompt },
      ],
    });
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(cleaned) as Omit<TriageResult, "urgency_label">;
    return { ...parsed, urgency_label: URGENCY_LABEL[parsed.urgency] ?? URGENCY_LABEL.monitor };
  });
