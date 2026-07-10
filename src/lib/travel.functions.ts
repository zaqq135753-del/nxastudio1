import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL, type ChatMessage } from "./ai-shared";

export type Activity = {
  time: string;
  title: string;
  description: string;
  category: "atracao" | "gastronomia" | "transporte" | "hospedagem" | "livre";
  estimated_cost_brl: number;
  tip?: string;
};

export type Day = {
  day: number;
  date?: string;
  theme: string;
  activities: Activity[];
  daily_total_brl: number;
};

export type BudgetBreakdown = {
  flights_brl: number;
  lodging_brl: number;
  food_brl: number;
  attractions_brl: number;
  transport_brl: number;
  extras_brl: number;
  total_brl: number;
};

export type Itinerary = {
  destination: string;
  overview: string;
  best_time_to_visit: string;
  days: Day[];
  budget_breakdown: BudgetBreakdown;
  packing_tips: string[];
  local_tips: string[];
};

export const listItineraries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("travel_itineraries")
      .select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const getItinerary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase.from("travel_itineraries")
      .select("*").eq("id", data.id).eq("user_id", context.userId).maybeSingle();
    return row;
  });

export const deleteItinerary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("travel_itineraries")
      .delete().eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });

export const createItinerary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    destination: string; start_date?: string; end_date?: string;
    travelers: number; budget_brl?: number; style?: string; interests?: string[];
    days_count: number;
  }) => d)
  .handler(async ({ data, context }) => {
    const perDay = data.days_count <= 4 ? 5 : data.days_count <= 8 ? 4 : 3;
    const system = `Você é agente de viagens brasileiro. Crie roteiro de ${data.days_count} dias para ${data.destination}.
Contexto: ${data.travelers} viajante(s), estilo "${data.style ?? "equilibrado"}", interesses: ${(data.interests ?? []).join(", ") || "gerais"}${data.budget_brl ? `, orçamento R$ ${data.budget_brl}` : ""}.
${data.start_date ? `Início: ${data.start_date}. ` : ""}Preços BRL realistas. Textos CURTOS (description ≤120 chars, tip ≤80).
Responda APENAS JSON válido, sem markdown:
{"destination":"${data.destination}","overview":"2-3 frases","best_time_to_visit":"...","days":[{"day":1,"theme":"...","activities":[{"time":"09:00","title":"...","description":"...","category":"atracao","estimated_cost_brl":50,"tip":"..."}],"daily_total_brl":250}],"budget_breakdown":{"flights_brl":0,"lodging_brl":0,"food_brl":0,"attractions_brl":0,"transport_brl":0,"extras_brl":0,"total_brl":0},"packing_tips":["..."],"local_tips":["..."]}
Inclua exatamente ${perDay} atividades por dia. 3 packing_tips e 3 local_tips.`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: data.destination }],
      temperature: 0.7, max_tokens: 8000,
    });
    const parsed = parseJson<Itinerary>(raw);

    const { data: saved, error } = await context.supabase.from("travel_itineraries")
      .insert({
        user_id: context.userId,
        destination: data.destination,
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
        travelers: data.travelers,
        budget_brl: data.budget_brl ?? null,
        style: data.style ?? null,
        interests: data.interests ?? [],
        days: parsed.days,
        budget_breakdown: parsed.budget_breakdown,
        status: "planned",
      }).select().maybeSingle();
    if (error) throw error;
    return { itinerary: parsed, saved };
  });

export const travelChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { history: ChatMessage[]; message: string }) => d)
  .handler(async ({ data }) => {
    const system = `Você é agente de viagens brasileiro atencioso e específico. Fale em pt-BR, sugira destinos com valores em BRL, épocas ideais, dicas locais. Seja conciso mas útil.`;
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        ...data.history.slice(-10),
        { role: "user", content: data.message },
      ],
      temperature: 0.8, max_tokens: 800,
    });
    return { reply: raw.trim() };
  });

export const featuredDestinations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return [
      { name: "Fernando de Noronha", country: "Brasil", tag: "Praia", tip: "Setembro-dezembro" },
      { name: "Chapada Diamantina", country: "Brasil", tag: "Natureza", tip: "Maio-setembro" },
      { name: "Lisboa", country: "Portugal", tag: "Cultura", tip: "Abril-junho" },
      { name: "Buenos Aires", country: "Argentina", tag: "Urbano", tip: "Ano todo" },
      { name: "Cartagena", country: "Colômbia", tag: "Praia", tip: "Dezembro-abril" },
      { name: "Tóquio", country: "Japão", tag: "Urbano", tip: "Março-maio" },
      { name: "Bariloche", country: "Argentina", tag: "Neve", tip: "Junho-setembro" },
      { name: "Marrocos", country: "Marrocos", tag: "Cultura", tip: "Março-maio" },
    ];
  });
