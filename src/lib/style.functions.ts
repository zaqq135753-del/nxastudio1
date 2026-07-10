import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, TEXT_MODEL } from "./ai-shared";

export type StyleItem = {
  id: string; category: string; name: string; color: string | null;
  season: string | null; image_url: string | null; tags: string[] | null;
  times_worn: number; last_worn_at: string | null;
};

export type Look = {
  name: string;
  occasion: string;
  description: string;
  pieces: { category: string; description: string; color: string }[];
  tips: string[];
};

export type ShopperSuggestion = {
  item: string;
  why: string;
  price_range: string;
  where: string;
  combines_with: string[];
};

export const getStyleProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("style_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();
    return data;
  });

export const upsertStyleProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    body_type?: string; style_words?: string[]; colors_favorite?: string[];
    colors_avoid?: string[]; occasions?: string[]; budget?: string; notes?: string;
  }) => d)
  .handler(async ({ data, context }) => {
    const { data: saved, error } = await context.supabase.from("style_profile")
      .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id" })
      .select().maybeSingle();
    if (error) throw error;
    return saved;
  });

export const listStyleItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("style_items")
      .select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return (data ?? []) as StyleItem[];
  });

export const addStyleItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { category: string; name: string; color?: string; season?: string; tags?: string[] }) => d)
  .handler(async ({ data, context }) => {
    const { data: saved, error } = await context.supabase.from("style_items")
      .insert({ ...data, user_id: context.userId }).select().maybeSingle();
    if (error) throw error;
    return saved;
  });

export const deleteStyleItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("style_items").delete()
      .eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });

export const generateLook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { occasion: string; weather?: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: items } = await context.supabase.from("style_items")
      .select("category,name,color,season,tags").eq("user_id", context.userId);
    const { data: profile } = await context.supabase.from("style_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();

    const wardrobe = (items ?? []).map((i) => `${i.category}: ${i.name}${i.color ? ` (${i.color})` : ""}`).join("\n");
    const prof = profile
      ? `Estilo: ${(profile.style_words ?? []).join(", ")}. Corpo: ${profile.body_type ?? "n/a"}. Cores favoritas: ${(profile.colors_favorite ?? []).join(", ")}. Evita: ${(profile.colors_avoid ?? []).join(", ")}.`
      : "Sem perfil ainda.";

    const system = `Você é uma personal stylist brasileira. Monte um look para a ocasião "${data.occasion}"${data.weather ? `, clima: ${data.weather}` : ""}.
Perfil do cliente: ${prof}
Guarda-roupa disponível:
${wardrobe || "(vazio — sugira peças gerais)"}
Responda APENAS em JSON válido:
{"name":"nome do look","occasion":"${data.occasion}","description":"1-2 frases","pieces":[{"category":"top|calça|sapato|acessório","description":"...","color":"..."}],"tips":["dica 1","dica 2","dica 3"]}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: data.occasion }],
      temperature: 0.8, max_tokens: 1200,
    });
    return parseJson<Look>(raw);
  });

export const saveLook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; occasion: string; description: string; item_ids?: string[] }) => d)
  .handler(async ({ data, context }) => {
    const { data: saved, error } = await context.supabase.from("style_looks")
      .insert({ ...data, item_ids: data.item_ids ?? [], user_id: context.userId })
      .select().maybeSingle();
    if (error) throw error;
    return saved;
  });

export const listLooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("style_looks")
      .select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(30);
    return data ?? [];
  });

export const personalShopper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { goal: string; budget?: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: items } = await context.supabase.from("style_items")
      .select("category,name,color").eq("user_id", context.userId);
    const { data: profile } = await context.supabase.from("style_profile")
      .select("*").eq("user_id", context.userId).maybeSingle();

    const wardrobe = (items ?? []).map((i) => `${i.category}: ${i.name}${i.color ? ` (${i.color})` : ""}`).join(", ");
    const prof = profile
      ? `Estilo: ${(profile.style_words ?? []).join(", ")}. Orçamento: ${data.budget ?? profile.budget ?? "médio"}`
      : `Orçamento: ${data.budget ?? "médio"}`;

    const system = `Você é personal shopper brasileira. Analise o guarda-roupa e sugira 5 peças-chave para investir com o objetivo "${data.goal}".
${prof}
Peças atuais: ${wardrobe || "nenhuma cadastrada"}
Considere: peças coringas, faixa de preço realista em BRL, onde comprar (marcas comuns no Brasil: Renner, Riachuelo, Zara, C&A, etc.).
Responda APENAS em JSON: {"suggestions":[{"item":"...","why":"...","price_range":"R$ X - Y","where":"marca/loja","combines_with":["peça atual","..."]}]}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: data.goal }],
      temperature: 0.7, max_tokens: 1800,
    });
    return parseJson<{ suggestions: ShopperSuggestion[] }>(raw).suggestions ?? [];
  });

export const styleStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ count: items }, { count: looks }, { data: unused }] = await Promise.all([
      context.supabase.from("style_items").select("id", { count: "exact", head: true }).eq("user_id", context.userId),
      context.supabase.from("style_looks").select("id", { count: "exact", head: true }).eq("user_id", context.userId),
      context.supabase.from("style_items").select("id").eq("user_id", context.userId).eq("times_worn", 0),
    ]);
    return { items: items ?? 0, looks: looks ?? 0, unused: unused?.length ?? 0 };
  });
