import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL } from "./ai-shared";

export type Horoscope = {
  overall: string;
  love: { text: string; score: number };
  career: { text: string; score: number };
  health: { text: string; score: number };
  spirituality: { text: string; score: number };
  lucky_numbers: number[];
  lucky_color: string;
  advice: string;
};

export type NatalChart = {
  sun_sign: string; moon_sign: string; rising_sign: string;
  summary: string;
  personality: string;
  strengths: string[];
  challenges: string[];
  life_purpose: string;
  houses: { house: number; theme: string; interpretation: string }[];
};

export type TarotCard = { name: string; position: string; upright: boolean; meaning: string };
export type TarotReading = { cards: TarotCard[]; interpretation: string; guidance: string };

export type Compatibility = {
  overall_score: number;
  love: number; friendship: number; communication: number;
  strengths: string[]; challenges: string[]; verdict: string;
};

const SIGNS = ["aries","touro","gemeos","cancer","leao","virgem","libra","escorpiao","sagitario","capricornio","aquario","peixes"];

function calcSunSign(month: number, day: number): string {
  const cuts: [number, number, string][] = [
    [1,19,"capricornio"],[2,18,"aquario"],[3,20,"peixes"],[4,19,"aries"],
    [5,20,"touro"],[6,20,"gemeos"],[7,22,"cancer"],[8,22,"leao"],
    [9,22,"virgem"],[10,22,"libra"],[11,21,"escorpiao"],[12,21,"sagitario"],[12,31,"capricornio"],
  ];
  for (const [m,d,s] of cuts) if (month < m || (month === m && day <= d)) return s;
  return "capricornio";
}

export const getCosmosProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("cosmos_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    return data;
  });

export const upsertCosmosProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { birth_date: string; birth_time?: string; birth_place?: string }) => d)
  .handler(async ({ data, context }) => {
    const [y,m,dd] = data.birth_date.split("-").map(Number);
    const sun = calcSunSign(m, dd);
    const { data: saved, error } = await context.supabase.from("cosmos_profile")
      .upsert({ ...data, sun_sign: sun, user_id: context.userId }, { onConflict: "user_id" })
      .select().maybeSingle();
    if (error) throw error;
    void y;
    return saved;
  });

export const generateNatalChart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: p } = await context.supabase.from("cosmos_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    if (!p?.birth_date) throw new Error("Complete seu perfil astrológico primeiro.");

    const system = `Você é astróloga profissional. Baseado no nascimento (${p.birth_date}${p.birth_time ? ` às ${p.birth_time}` : ""}${p.birth_place ? `, ${p.birth_place}` : ""}, Sol em ${p.sun_sign}), gere um mapa astral resumido em português.
Responda APENAS em JSON:
{"sun_sign":"${p.sun_sign}","moon_sign":"...","rising_sign":"...","summary":"3-4 frases","personality":"parágrafo","strengths":["...","...","..."],"challenges":["...","...","..."],"life_purpose":"...","houses":[{"house":1,"theme":"identidade","interpretation":"..."},{"house":7,"theme":"relacionamentos","interpretation":"..."},{"house":10,"theme":"carreira","interpretation":"..."}]}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: "Gere meu mapa astral." }],
      temperature: 0.75, max_tokens: 2000,
    });
    const parsed = parseJson<NatalChart>(raw);
    await context.supabase.from("cosmos_profile").update({
      chart: parsed, moon_sign: parsed.moon_sign, rising_sign: parsed.rising_sign,
    }).eq("user_id", context.userId);
    return parsed;
  });

export const dailyHoroscope = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data: cached } = await context.supabase.from("cosmos_horoscopes")
      .select("content").eq("user_id", context.userId).eq("for_date", today).maybeSingle();
    if (cached?.content) return cached.content as Horoscope;

    const { data: p } = await context.supabase.from("cosmos_profile")
      .select("sun_sign,moon_sign,rising_sign").eq("user_id", context.userId).maybeSingle();
    if (!p?.sun_sign) throw new Error("Complete seu perfil astrológico primeiro.");

    const system = `Astróloga. Horóscopo do dia (${today}) para Sol ${p.sun_sign}${p.moon_sign ? `, Lua ${p.moon_sign}` : ""}${p.rising_sign ? `, Asc ${p.rising_sign}` : ""}.
Responda APENAS em JSON: {"overall":"2-3 frases","love":{"text":"...","score":4},"career":{"text":"...","score":3},"health":{"text":"...","score":5},"spirituality":{"text":"...","score":4},"lucky_numbers":[7,14,22],"lucky_color":"azul","advice":"conselho final"}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: "Gere meu horóscopo de hoje." }],
      temperature: 0.85, max_tokens: 900,
    });
    const parsed = parseJson<Horoscope>(raw);
    await context.supabase.from("cosmos_horoscopes").insert({
      user_id: context.userId, for_date: today, content: parsed,
    });
    return parsed;
  });

const TAROT_DECK = [
  "O Louco","O Mago","A Sacerdotisa","A Imperatriz","O Imperador","O Hierofante","Os Enamorados","O Carro",
  "A Força","O Eremita","A Roda da Fortuna","A Justiça","O Enforcado","A Morte","A Temperança","O Diabo",
  "A Torre","A Estrela","A Lua","O Sol","O Julgamento","O Mundo",
];

export const drawTarot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { question: string; spread?: "single" | "three" }) => d)
  .handler(async ({ data, context }) => {
    const spread = data.spread ?? "three";
    const positions = spread === "single" ? ["Situação"] : ["Passado", "Presente", "Futuro"];
    const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    const drawn = positions.map((pos, i) => ({
      name: shuffled[i], position: pos, upright: Math.random() > 0.35,
    }));

    const system = `Tarólogo experiente. Pergunta: "${data.question}". Cartas tiradas: ${drawn.map(c => `${c.position}: ${c.name} (${c.upright ? "direita" : "invertida"})`).join(" | ")}.
Responda APENAS em JSON: {"cards":[{"name":"...","position":"...","upright":true,"meaning":"significado dessa carta nessa posição"}],"interpretation":"leitura conjunta em 2 parágrafos","guidance":"conselho prático"}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(drawn) },
      ],
      temperature: 0.9, max_tokens: 1500,
    });
    const parsed = parseJson<TarotReading>(raw);
    await context.supabase.from("cosmos_tarot_readings").insert({
      user_id: context.userId, question: data.question, spread,
      cards: parsed.cards, interpretation: parsed.interpretation,
    });
    return parsed;
  });

export const listTarotHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("cosmos_tarot_readings")
      .select("id,question,spread,cards,interpretation,created_at")
      .eq("user_id", context.userId).order("created_at", { ascending: false }).limit(20);
    return data ?? [];
  });

export const compatibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { partner_name: string; partner_birth_date: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: p } = await context.supabase.from("cosmos_profile")
      .select("sun_sign,birth_date").eq("user_id", context.userId).maybeSingle();
    if (!p?.sun_sign) throw new Error("Complete seu perfil primeiro.");
    const [, m, dd] = data.partner_birth_date.split("-").map(Number);
    const partnerSign = calcSunSign(m, dd);

    const system = `Astrólogo. Compare o sinastria entre Sol ${p.sun_sign} e Sol ${partnerSign} (${data.partner_name}).
Responda APENAS em JSON: {"overall_score":85,"love":90,"friendship":75,"communication":70,"strengths":["...","...","..."],"challenges":["...","..."],"verdict":"parágrafo final"}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: `${p.sun_sign} x ${partnerSign}` }],
      temperature: 0.75, max_tokens: 1000,
    });
    return { ...parseJson<Compatibility>(raw), partner_sign: partnerSign };
  });

export { SIGNS, calcSunSign };
