import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TEXT_MODEL = "openai/gpt-5-mini";
const VISION_MODEL = "openai/gpt-5";
const IMAGE_MODEL = "google/gemini-2.5-flash-image";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

/**
 * Se o model começa com "openai/" e OPENAI_API_KEY existe → chama OpenAI direto (chave do usuário).
 * Caso contrário → Lovable AI Gateway.
 */
async function callGateway(body: {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const useOpenAI = openaiKey && body.model.startsWith("openai/");

  const url = useOpenAI ? OPENAI_URL : GATEWAY_URL;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const payload = { ...body };

  if (useOpenAI) {
    headers["Authorization"] = `Bearer ${openaiKey}`;
    payload.model = body.model.replace(/^openai\//, "");
  } else {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurada");
    headers["Lovable-API-Key"] = key;
  }

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Muitas requisições. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
    if (res.status === 401 && useOpenAI) throw new Error("OPENAI_API_KEY inválida ou sem créditos.");
    throw new Error(`Erro da IA: ${res.status} ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}


function parseJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const sanitized = slice
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/,\s*([}\]])/g, "$1");

  for (const attempt of [slice, sanitized, balanceBrackets(sanitized)]) {
    try {
      return JSON.parse(attempt) as T;
    } catch {
      /* try next */
    }
  }
  console.error("[parseJson] Resposta IA inválida:", raw.slice(0, 800));
  throw new Error("A IA retornou uma resposta inválida. Tente novamente.");
}

// Repara JSON truncado: fecha string aberta e balanceia { [ pendentes.
function balanceBrackets(input: string): string {
  let s = input;
  let inStr = false;
  let escape = false;
  const stack: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escape) { escape = false; continue; }
    if (c === "\\") { escape = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" && stack[stack.length - 1] === "{") stack.pop();
    else if (c === "]" && stack[stack.length - 1] === "[") stack.pop();
  }
  if (inStr) s += '"';
  s = s.replace(/,\s*$/, "");
  while (stack.length) {
    const open = stack.pop();
    s += open === "{" ? "}" : "]";
  }
  return s;
}

/* ================= Geladeira ================= */

export type FridgeRecipe = {
  name: string;
  emoji: string;
  time: string;
  servings: string;
  difficulty: string;
  calories: string;
  description: string;
  ingredients: string[];
  steps: string[];
};

export const generateRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: { ingredients: string[] }) => {
    if (!data || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      throw new Error("Adicione pelo menos um ingrediente");
    }
    return { ingredients: data.ingredients.slice(0, 30).map((s) => String(s).slice(0, 60)) };
  })
  .handler(async ({ data }) => {
    const system = `Você é um chef de cozinha profissional brasileiro. Com base nos ingredientes que o usuário tem disponível, crie UMA receita completa e prática.

Responda APENAS em JSON válido com esta estrutura:
{
  "name": "Nome da receita",
  "emoji": "emoji relevante",
  "time": "tempo total estimado (ex: 35 min)",
  "servings": "X porções",
  "difficulty": "Muito Fácil | Fácil | Médio | Difícil",
  "calories": "X kcal por porção",
  "description": "Descrição curta e apetitosa da receita (2 frases)",
  "ingredients": ["ingrediente 1 com quantidade", "ingrediente 2"],
  "steps": ["passo 1", "passo 2"]
}

Regras:
- Use PRINCIPALMENTE os ingredientes informados (pode incluir básicos: sal, pimenta, azeite, água)
- Receita realista e executável
- Inclua quantidades específicas
- Varie o tipo de receita a cada geração`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Ingredientes disponíveis: ${data.ingredients.join(", ")}` },
      ],
    });
    return parseJson<FridgeRecipe>(raw);
  });

/* ================= Foto ================= */

export type PhotoResult = {
  identified?: string;
  confidence?: number;
  origin?: string;
  description?: string;
  ingredients?: string[];
  steps?: string[];
  tip?: string;
  error?: string;
};

export const analyzePhoto = createServerFn({ method: "POST" })
  .inputValidator((data: { imageBase64: string; cuisine: string }) => {
    if (!data?.imageBase64 || !data.imageBase64.startsWith("data:image/")) {
      throw new Error("Imagem inválida");
    }
    return { imageBase64: data.imageBase64, cuisine: String(data.cuisine || "Qualquer") };
  })
  .handler(async ({ data }) => {
    const system = `Você é um especialista em gastronomia mundial. Analise a imagem do prato e:
1. Identifique o prato com nível de confiança
2. Informe a origem/culinária (preferência: ${data.cuisine})
3. Dê contexto histórico/cultural (2-3 frases)
4. Gere a receita completa

Responda APENAS em JSON válido:
{
  "identified": "Nome do prato",
  "confidence": 94,
  "origin": "Culinária de origem",
  "description": "Contexto histórico e cultural",
  "ingredients": ["ingrediente com quantidade"],
  "steps": ["passo 1"],
  "tip": "Dica profissional do chef"
}

Se a imagem não for comida:
{ "error": "Não identifiquei um prato de comida nesta imagem. Envie uma foto de comida." }`;

    const raw = await callGateway({
      model: VISION_MODEL,
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: "Analise esta imagem e retorne o JSON." },
            { type: "image_url", image_url: { url: data.imageBase64 } },
          ],
        },
      ],
    });
    return parseJson<PhotoResult>(raw);
  });

/* ================= Meal Planner ================= */

export type MealPlan = {
  days: Array<{
    day: string;
    meals: Array<{ type: string; name: string; detail: string }>;
  }>;
  shoppingList: string[];
  totalEstimatedCost: string;
};

export const generateMealPlan = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { goal: string; people: number; restrictions: string[]; budget: string }) => ({
      goal: String(data.goal || "Alimentação Saudável"),
      people: Math.max(1, Math.min(6, Number(data.people) || 1)),
      restrictions: Array.isArray(data.restrictions) ? data.restrictions.map(String) : [],
      budget: String(data.budget || "R$150-R$300"),
    }),
  )
  .handler(async ({ data }) => {
    const system = `Você é nutricionista e chef brasileiro. Crie um plano alimentar semanal completo e realista.

Responda APENAS em JSON válido:
{
  "days": [{"day": "Segunda-feira", "meals": [{"type": "Café da Manhã", "name": "...", "detail": "... — X kcal"}]}],
  "shoppingList": ["item (quantidade)"],
  "totalEstimatedCost": "R$ XXX - R$ XXX"
}

Regras:
- 7 dias (Segunda a Domingo)
- 4 refeições por dia: Café da Manhã, Almoço, Lanche, Jantar
- Varie os ingredientes ao longo da semana
- Respeite TODAS as restrições
- Mantenha dentro do orçamento
- Inclua calorias estimadas por refeição
- Ingredientes acessíveis no Brasil`;

    const user = `Objetivo: ${data.goal}
Pessoas: ${data.people}
Restrições: ${data.restrictions.length ? data.restrictions.join(", ") : "nenhuma"}
Orçamento semanal: ${data.budget}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return parseJson<MealPlan>(raw);
  });

/* ================= Nutri chat ================= */

export const nutriChat = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: Array<{ role: "user" | "assistant"; content: string }> }) => {
    if (!Array.isArray(data?.messages) || data.messages.length === 0) {
      throw new Error("Mensagens inválidas");
    }
    return {
      messages: data.messages.slice(-10).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content).slice(0, 2000),
      })) as ChatMessage[],
    };
  })
  .handler(async ({ data }) => {
    const system = `Você é um nutricionista virtual brasileiro, amigável e didático.

Especialidades:
- Análise nutricional de receitas e refeições
- Contagem de macros (calorias, proteínas, carboidratos, gorduras)
- Sugestões de substituições saudáveis
- Dicas para metas específicas
- Alimentação balanceada

Regras:
- Responda em Português Brasileiro
- Use formatação clara com emojis e **negrito**
- Inclua valores nutricionais aproximados quando possível
- NUNCA prescreva dietas restritivas sem recomendar acompanhamento profissional
- Inclua um disclaimer sutil de que orientações não substituem nutricionista
- Alimentos acessíveis no Brasil
- Máximo 200 palavras`;

    const content = await callGateway({
      model: TEXT_MODEL,
      temperature: 0.7,
      max_tokens: 800,
      messages: [{ role: "system", content: system }, ...data.messages],
    });
    return { content };
  });

/* ================= Recipe Image Generation (Nano Banana) ================= */

export const generateRecipeImage = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; description?: string }) => ({
    name: String(data?.name || "").slice(0, 120),
    description: String(data?.description || "").slice(0, 300),
  }))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurada");
    if (!data.name) throw new Error("Nome da receita obrigatório");

    const prompt = `Fotografia gastronômica profissional editorial, vista aérea 45°, luz natural suave, prato brasileiro autêntico servido em louça artesanal sobre mesa de madeira rústica com pequenos props (ervas frescas, guardanapo de linho). Alta resolução, cores vibrantes e realistas, foco nítido no prato, fundo levemente desfocado, estilo revista de culinária premium. Prato: ${data.name}. ${data.description}`;

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Muitas requisições. Aguarde um instante.");
      if (res.status === 402) throw new Error("Créditos de IA esgotados.");
      throw new Error(`Falha ao gerar imagem: ${res.status} ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const url = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) throw new Error("A IA não retornou imagem. Tente novamente.");
    return { imageUrl: url as string };
  });

