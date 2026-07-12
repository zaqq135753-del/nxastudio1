import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL } from "./ai-shared";


// ---------- Types ----------
export type CaptionResult = {
  caption: string;
  hashtags: string[];
  hook: string;
  tips: string[];
};

export type PostIdea = {
  idea: string;
  type: "photo" | "video" | "carousel" | "story" | "reel";
  hook: string;
  cta: string;
};

export type CalendarPost = {
  date: string;
  time: string;
  type: "photo" | "video" | "carousel" | "story" | "reel";
  theme: string;
  description: string;
  goal: string;
  captionIdea: string;
};

export type HashtagItem = {
  tag: string;
  category: "popular" | "medium" | "specific";
  estimatedReach: "high" | "medium" | "low";
};

export type ProfileAnalysis = {
  bio: { score: number; feedback: string; suggestion: string };
  content: { strengths: string[]; weaknesses: string[] };
  engagement: { estimatedRate: string; feedback: string };
  opportunities: string[];
  actions: { priority: "high" | "medium" | "low"; action: string }[];
};

export type VideoScript = {
  hook: string;
  content: string[];
  cta: string;
  durationSeconds: number;
};

// ---------- Server functions ----------

export const generateCaption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    postType: string; goal: string; tone: string;
    description: string; keywords: string; cta: string; length: string;
  }) => d)
  .handler(async ({ data, context }) => {
    const system = `Você é um copywriter brasileiro especializado em redes sociais (Instagram, TikTok, Facebook).
Crie uma legenda engajadora para o post. Responda APENAS em JSON válido:
{"caption":"...","hashtags":["#a","#b"],"hook":"...","tips":["..."]}
Regras: 2-5 emojis; primeira linha é hook impactante; CTA claro no final; 5-10 hashtags misturando populares e específicas; sem clichês.`;
    const user = `Tipo: ${data.postType}
Objetivo: ${data.goal}
Tom: ${data.tone}
Descrição: ${data.description}
Palavras-chave: ${data.keywords}
CTA desejado: ${data.cta}
Tamanho: ${data.length}`;
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.8, max_tokens: 1200,
    });
    const result = parseJson<CaptionResult>(raw);
    await context.supabase.from("social_contents").insert({
      user_id: context.userId, kind: "caption",
      title: data.description.slice(0, 80), payload: result,
    });
    return result;
  });

export const generateIdeas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { niche: string; count?: number }) => d)
  .handler(async ({ data, context }) => {
    const n = data.count ?? 10;
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um estrategista de conteúdo brasileiro. Gere ${n} ideias de post criativas. Responda APENAS em JSON: {"ideas":[{"idea":"...","type":"photo|video|carousel|story|reel","hook":"...","cta":"..."}]}` },
        { role: "user", content: `Nicho: ${data.niche}` },
      ],
      temperature: 0.85, max_tokens: 2000,
    });
    const result = parseJson<{ ideas: PostIdea[] }>(raw);
    await context.supabase.from("social_contents").insert({
      user_id: context.userId, kind: "idea", title: data.niche, payload: result,
    });
    return result.ideas;
  });

export const generateVideoScript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; goal: string; style: string; duration: number }) => d)
  .handler(async ({ data, context }) => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um roteirista brasileiro de vídeos curtos (Reels/TikTok/Shorts). Responda APENAS em JSON: {"hook":"primeiros 3s","content":["cena 1","cena 2","..."],"cta":"...","durationSeconds": ${data.duration}}` },
        { role: "user", content: `Tema: ${data.topic}\nObjetivo: ${data.goal}\nEstilo: ${data.style}\nDuração: ${data.duration}s` },
      ],
      temperature: 0.8, max_tokens: 1200,
    });
    const result = parseJson<VideoScript>(raw);
    await context.supabase.from("social_contents").insert({
      user_id: context.userId, kind: "video_script", title: data.topic, payload: result,
    });
    return result;
  });

export const generateCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { niche: string; frequency: string; duration: string; goals: string[] }) => d)
  .handler(async ({ data, context }) => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um estrategista brasileiro. Crie um calendário editorial. Datas começam a partir de hoje (${new Date().toISOString().slice(0,10)}). Responda APENAS em JSON: {"posts":[{"date":"YYYY-MM-DD","time":"HH:MM","type":"photo|video|carousel|story|reel","theme":"...","description":"...","goal":"...","captionIdea":"..."}]} Varie tipos e objetivos, respeite a frequência.` },
        { role: "user", content: `Nicho: ${data.niche}\nFrequência: ${data.frequency}\nDuração: ${data.duration}\nObjetivos: ${data.goals.join(", ")}` },
      ],
      temperature: 0.7, max_tokens: 3000,
    });
    const result = parseJson<{ posts: CalendarPost[] }>(raw);
    const { data: saved } = await context.supabase.from("social_calendars").insert({
      user_id: context.userId, name: `${data.niche} · ${data.duration}`,
      niche: data.niche, frequency: data.frequency, duration: data.duration,
      goals: data.goals, posts: result.posts,
    }).select("id").maybeSingle();
    return { id: saved?.id, posts: result.posts };
  });

export const listCalendars = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("social_calendars")
      .select("id, name, niche, duration, posts, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  });

export const generateHashtags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { niche: string; theme: string; location?: string; language: string; quantity: number }) => d)
  .handler(async ({ data }) => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é especialista em hashtags para redes sociais. Responda APENAS em JSON: {"hashtags":[{"tag":"#exemplo","category":"popular|medium|specific","estimatedReach":"high|medium|low"}]} Misture populares e específicas, evite hashtags banidas.` },
        { role: "user", content: `Nicho: ${data.niche}\nTema: ${data.theme}\nLocalização: ${data.location ?? "-"}\nIdioma: ${data.language}\nQuantidade: ${data.quantity}` },
      ],
      temperature: 0.8, max_tokens: 1500,
    });
    return parseJson<{ hashtags: HashtagItem[] }>(raw).hashtags;
  });

export const saveHashtagSet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; hashtags: HashtagItem[] }) => d)
  .handler(async ({ data, context }) => {
    const { data: saved, error } = await context.supabase
      .from("social_hashtag_sets")
      .insert({ user_id: context.userId, name: data.name, hashtags: data.hashtags })
      .select("id").maybeSingle();
    if (error) throw error;
    return { id: saved?.id };
  });

export const listHashtagSets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("social_hashtag_sets")
      .select("id, name, hashtags, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw error;
    return data ?? [];
  });

export const analyzeProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { profileUrl: string; platform: string; bio?: string; recentPosts?: string }) => d)
  .handler(async ({ data, context }) => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um consultor brasileiro de redes sociais. Analise o perfil descrito e sugira melhorias práticas. Responda APENAS em JSON:
{"bio":{"score":0-10,"feedback":"...","suggestion":"..."},"content":{"strengths":["..."],"weaknesses":["..."]},"engagement":{"estimatedRate":"X%","feedback":"..."},"opportunities":["..."],"actions":[{"priority":"high|medium|low","action":"..."}]}` },
        { role: "user", content: `URL: ${data.profileUrl}\nPlataforma: ${data.platform}\nBio atual: ${data.bio ?? "(não informada)"}\nPosts recentes: ${data.recentPosts ?? "(não informados)"}` },
      ],
      temperature: 0.6, max_tokens: 2000,
    });
    const result = parseJson<ProfileAnalysis>(raw);
    await context.supabase.from("social_contents").insert({
      user_id: context.userId, kind: "analysis", title: data.profileUrl, payload: result,
    });
    return result;
  });

export const dailyIdea = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { niche: string }) => d)
  .handler(async ({ data }) => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um estrategista brasileiro de conteúdo. Gere UMA ideia de post para hoje. Responda APENAS em JSON: {"idea":"...","type":"photo|video|carousel|story|reel","hook":"...","cta":"..."}` },
        { role: "user", content: `Nicho: ${data.niche}` },
      ],
      temperature: 0.85, max_tokens: 400,
    });
    return parseJson<PostIdea>(raw);
  });

export const listRecentContents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("social_contents")
      .select("id, kind, title, payload, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  });

export const getSocialStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("social_contents")
      .select("kind")
      .eq("user_id", context.userId);
    const rows = data ?? [];
    const count = (k: string) => rows.filter((r) => r.kind === k).length;
    const { count: calendarsCount } = await context.supabase
      .from("social_calendars").select("*", { count: "exact", head: true })
      .eq("user_id", context.userId);
    return {
      captions: count("caption"),
      ideas: count("idea"),
      scripts: count("video_script"),
      analyses: count("analysis"),
      calendars: calendarsCount ?? 0,
    };
  });
