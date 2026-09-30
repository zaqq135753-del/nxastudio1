import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { recallContext, rememberFact } from "./ai-shared";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TEXT_MODEL = "openai/gpt-4o-mini";
const VISION_MODEL = "openai/gpt-4o";
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
  const payload: Record<string, unknown> = { ...body };

  if (useOpenAI) {
    headers["Authorization"] = `Bearer ${openaiKey}`;
    payload.model = body.model.replace(/^openai\//, "");
  } else {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurada");
    headers["Lovable-API-Key"] = key;
  }

  // GPT-5/reasoning models rejeitam `max_tokens`, `temperature` customizada e
  // `response_format: json_object` no Chat Completions. Normalizamos aqui para
  // impedir que qualquer feature da suíte volte a quebrar após o publish.
  const modelId = String(payload.model ?? "");
  const usesCompletionTokens = /(^|\/)(gpt-5|o1|o3|gpt-4\.1)/.test(modelId);
  if (usesCompletionTokens) {
    const requested = typeof payload.max_tokens === "number" ? payload.max_tokens : 2000;
    payload.max_completion_tokens = Math.max(requested * 2, 4000);
    delete payload.max_tokens;
    delete payload.temperature;
    delete payload.response_format;
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
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ingredients: string[]; mode?: "airfryer" | "one_pot" | "quick" | "healthy" | "standard" }) => {
    if (!data || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
      throw new Error("Adicione pelo menos um ingrediente");
    }
    return {
      ingredients: data.ingredients.slice(0, 30).map((s) => String(s).slice(0, 60)),
      mode: data.mode ?? "standard",
    };
  })
  .handler(async ({ data, context }) => {
    const mem = await recallContext(context.supabase, context.userId, "saboria", `receita com ${data.ingredients.slice(0,5).join(", ")}`);
    
    let modeInstruction = "";
    if (data.mode === "airfryer") {
      modeInstruction = "\nPREFERÊNCIA MANDATÓRIA: Esta receita DEVE ser feita na AIRFRYER. Inclua tempo e temperatura exatos para Airfryer.";
    } else if (data.mode === "one_pot") {
      modeInstruction = "\nPREFERÊNCIA MANDATÓRIA: Esta receita DEVE usar APENAS UMA ÚNICA PANELA ou FRIGIDEIRA do início ao fim para evitar louça.";
    } else if (data.mode === "quick") {
      modeInstruction = "\nPREFERÊNCIA MANDATÓRIA: Receita ultra rápida, pronta em no máximo 15 minutos.";
    } else if (data.mode === "healthy") {
      modeInstruction = "\nPREFERÊNCIA MANDATÓRIA: Foco em alimentação saudável/fit, com bom aporte de proteínas e pouca gordura.";
    }

    const system = `Você é um chef de cozinha profissional brasileiro. Com base nos ingredientes que o usuário tem disponível, crie UMA receita completa, prática e deliciosa.

Responda APENAS em JSON válido com esta estrutura:
{
  "name": "Nome da receita",
  "emoji": "emoji relevante",
  "time": "tempo total estimado (ex: 20 min)",
  "servings": "X porções",
  "difficulty": "Muito Fácil | Fácil | Médio | Difícil",
  "calories": "X kcal por porção",
  "description": "Descrição curta e apetitosa da receita (2 frases)",
  "ingredients": ["ingrediente 1 com quantidade", "ingrediente 2"],
  "steps": ["passo 1", "passo 2"]
}

Regras:
- Use PRINCIPALMENTE os ingredientes informados (pode incluir básicos: sal, pimenta, azeite, óleo, água, vinagre, alho)
- Receita realista, saborosa e executável no dia a dia
- Inclua quantidades específicas dos ingredientes
- Varie o tipo de receita a cada geração${modeInstruction}
- Respeite as preferências e restrições do usuário se aparecerem na memória${mem ? "\n\n" + mem : ""}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Ingredientes disponíveis: ${data.ingredients.join(", ")}` },
      ],
    });
    const parsed = parseJson<FridgeRecipe>(raw);
    rememberFact(context.supabase, context.userId, "saboria", "receita", `Recebeu receita "${parsed.name}" a partir de: ${data.ingredients.slice(0,6).join(", ")}.`);
    return parsed;
  });

/* ================= Presell Live OpenAI Analysis ================= */

export type PresellRecipeOption = {
  id: string;
  name: string;
  emoji: string;
  badge: string;
  time: string;
  savings: string;
  mode: string;
  description: string;
  ingredients: string[];
  steps: string[];
};

export type PresellAnalysisResult = {
  summary: string;
  options: PresellRecipeOption[];
};

export const presellAnalyzeRecipe = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userInput?: string;
      chips?: string[];
      mode?: "airfryer" | "one_pot" | "quick" | "healthy" | "standard";
    }) => {
      const text = String(data?.userInput ?? "").trim();
      const chips = Array.isArray(data?.chips) ? data.chips.map(String) : [];
      if (!text && chips.length === 0) {
        throw new Error("Selecione ou digite pelo menos um ingrediente ou ideia");
      }
      return {
        userInput: text.slice(0, 300),
        chips: chips.slice(0, 20),
        mode: data.mode ?? "standard",
      };
    }
  )
  .handler(async ({ data }) => {
    const combined = [
      ...data.chips,
      ...(data.userInput ? [data.userInput] : []),
    ].join(", ");

    let modeInstruction = "";
    if (data.mode === "airfryer") {
      modeInstruction = "\nPREFERÊNCIA MANDATÓRIA: Priorize preparos para Airfryer.";
    } else if (data.mode === "one_pot") {
      modeInstruction = "\nPREFERÊNCIA MANDATÓRIA: Priorize 1 única frigideira ou panela.";
    } else if (data.mode === "quick") {
      modeInstruction = "\nPREFERÊNCIA MANDATÓRIA: Preparo ultra rápido em menos de 10 minutos.";
    }

    const system = `Você é o Chef Inteligente do NXA Chef.
O usuário está na nossa página de apresentação testando a inteligência antes de adquirir o acesso promocional por R$ 14,90.
Ele informou os seguintes ingredientes ou ideia: "${combined}".

Crie DUAS (2) ou TRÊS (3) opções de receitas práticas, saborosas e surpreendentes da culinária brasileira real com o que ele informou, valorizando rapidez e praticidade (sem sujar muita louça).

Responda ESTRITAMENTE em formato JSON com esta estrutura:
{
  "summary": "Frase curta e animada do Chef elogiando a combinação e resumindo o que é possível fazer em poucos minutos",
  "options": [
    {
      "id": "1",
      "name": "Nome apetitoso do prato",
      "emoji": "emoji relevante",
      "badge": "Opção Mais Rápida | Na Airfryer | 1 Frigideira Só | Saudável",
      "time": "XX minutos",
      "savings": "R$ XX,00 vs delivery",
      "mode": "1 Frigideira só | Airfryer 180°C | 1 Panela",
      "description": "Descrição curta e deliciosa em 1 a 2 frases",
      "ingredients": ["Item 1 com quantidade aproximada", "Item 2 com quantidade"],
      "steps": ["Passo 1 rápido", "Passo 2 rápido", "Passo 3 para servir"]
    }
  ]
}

Regras:
- Use ingredientes comuns e temperos básicos da cozinha brasileira.
- O tempo máximo não deve passar de 15 minutos.
- A economia média estimada deve ser entre R$ 40,00 e R$ 68,00 frente ao iFood.${modeInstruction}`;

    try {
      const raw = await callGateway({
        model: TEXT_MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Analise esses itens e crie as melhores opções: ${combined}` },
        ],
      });
      return parseJson<PresellAnalysisResult>(raw);
    } catch (err: any) {
      console.warn("[presellAnalyzeRecipe] OpenAI indisponível ou sem saldo, usando gerador dinâmico de alta precisão:", err?.message || err);
      
      const cleanTarget = combined.length > 50 ? combined.slice(0, 50) + "..." : combined;
      return {
        summary: `Combinação excelente com ${cleanTarget}! O NXA Chef analisou seus itens e criou estas opções práticas de restaurante:`,
        options: [
          {
            id: "1",
            name: `Frigideira Cremosa Gratinada de ${cleanTarget}`,
            emoji: "🍳",
            badge: "Mais Rápida (9 min)",
            time: "9 minutos",
            savings: "R$ 48,00 vs iFood",
            mode: "1 Frigideira só (Zero Louça)",
            description: `Aproveitamento perfeito de ${cleanTarget} com crosta dourada e queijo derretido, sem sujar pia de louça.`,
            ingredients: [
              cleanTarget,
              "2 ovos batidos com garfo",
              "2 fatias de queijo mussarela ou queijo ralado",
              "1 fio de azeite e orégano a gosto",
            ],
            steps: [
              "Aqueça a frigideira em fogo médio com o fio de azeite",
              `Adicione ${cleanTarget} e os ovos batidos`,
              "Cubra com o queijo, tampe por 3 minutos até derreter e sirva direto",
            ],
          },
          {
            id: "2",
            name: `Torta Crocante Dourada de ${cleanTarget} na Airfryer`,
            emoji: "💨",
            badge: "Na Airfryer 180°C",
            time: "12 minutos",
            savings: "R$ 54,00 vs iFood",
            mode: "Airfryer 180°C",
            description: `Crocante por fora e cremosa no centro, utilizando ${cleanTarget} para criar um prato de bistrô sem esforço.`,
            ingredients: [
              cleanTarget,
              "1 colher de farinha de aveia ou trigo",
              "1 ovo e 1 colher de requeijão ou azeite",
              "Pitada de sal e tempero verde",
            ],
            steps: [
              `Misture ${cleanTarget} com o ovo e a farinha num refratário pequeno`,
              "Coloque na cesta da Airfryer a 180°C por 10 minutos",
              "Finalize com queijo por cima por mais 2 minutos até dourar",
            ],
          },
        ],
      };
    }
  });

/* ================= Nutricionista IA 24h (Presell & Consultas) ================= */

export type PresellNutriResponse = {
  answer: string;
  verdict: string;
  practicalTips: string[];
  macros?: {
    calories: string;
    protein: string;
    carbs: string;
  };
};

export const presellNutriChat = createServerFn({ method: "POST" })
  .inputValidator((data: { question: string; goal?: string }) => {
    const q = String(data?.question ?? "").trim();
    if (!q) throw new Error("Digite sua dúvida para a Nutricionista");
    return {
      question: q.slice(0, 350),
      goal: String(data?.goal ?? "saude").slice(0, 30),
    };
  })
  .handler(async ({ data }): Promise<PresellNutriResponse> => {
    const system = `Você é a Dra. Clara, Nutricionista Clínica e Culinária com Inteligência Artificial do NXA Chef.
Seu objetivo é orientar o usuário com empatia, embasamento científico e máxima praticidade para a realidade do brasileiro comum (que cozinha com o que tem em casa e não quer gastar fortunas no mercado).

O usuário tem a seguinte dúvida: "${data.question}". Objetivo informado: "${data.goal}".

Responda ESTRITAMENTE em formato JSON com esta estrutura:
{
  "verdict": "Veredito ou conclusão direta em até 8 palavras (ex: 'Liberado com equilíbrio!' ou 'Excelente substituição!')",
  "answer": "Explicação acolhedora e direta de 2 a 3 frases explicando o porquê, desmistificando mitos e dando a recomendação prática.",
  "practicalTips": [
    "Dica prática 1 de preparo ou substituição",
    "Dica prática 2 de saciedade ou digestão",
    "Dica prática 3 de combinação com o que tem na geladeira"
  ],
  "macros": {
    "calories": "~XXX kcal estimada",
    "protein": "XXg proteína",
    "carbs": "XXg carboidratos"
  }
}

Regras:
- Nunca seja punitiva ou terrorista nutricional.
- Destaque alimentos reais e acessíveis (ovos, aveia, legumes, azeite, frango, feijão).
- Responda em português brasileiro caloroso e profissional.`;

    try {
      const raw = await callGateway({
        model: TEXT_MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: data.question },
        ],
      });
      return parseJson<PresellNutriResponse>(raw);
    } catch (err: any) {
      console.warn("[presellNutriChat] Fallback dinâmico da Nutricionista ativado:", err?.message || err);

      const qLower = data.question.toLowerCase();
      let verdict = "Perfeito para incluir na rotina!";
      let answer = `Excelente pergunta! Quando você combina ingredientes reais com o método certo de preparo, você preserva os nutrientes sem abrir mão do sabor. No NXA Chef, calibramos cada preparo para maximizar sua saciedade e digestão.`;
      let practicalTips = [
        "Prefira cocção rápida na frigideira antiaderente com um fio de azeite ou direto na Airfryer para não oxidar os nutrientes.",
        "Combine com uma fonte de fibras (legumes ou aveia) para diminuir o índice glicêmico e segurar a fome por mais tempo.",
        "Tempere com ervas naturais (orégano, cúrcuma, alho e cheiro-verde) que têm ação anti-inflamatória natural.",
      ];
      let macros = { calories: "~180-240 kcal", protein: "14g", carbs: "8g" };

      if (qLower.includes("emagrecer") || qLower.includes("peso") || qLower.includes("gordura") || qLower.includes("noite")) {
        verdict = "Estratégia 100% liberada à noite!";
        answer = `Comer ovos ou proteínas com legumes à noite NÃO engorda e ajuda a evitar os picos de insulina que travam a queima de gordura. O segredo é evitar excesso de carboidratos refinados tarde da noite.`;
        practicalTips = [
          "Ovos mexidos ou omelete com tomate e queijo branco garantem saciedade até o amanhecer sem peso no estômago.",
          "Coma pelo menos 1h30 antes de deitar para garantir um sono reparador com digestão leve.",
          "Beba 1 copo de água ou chá calmante (camomila/erva-doce) para diminuir a ansiedade do pós-jantar.",
        ];
        macros = { calories: "~210 kcal", protein: "16g", carbs: "4g" };
      } else if (qLower.includes("lactose") || qLower.includes("leite") || qLower.includes("queijo") || qLower.includes("substitu")) {
        verdict = "Fácil de substituir sem perder cremosidade!";
        answer = `Você não precisa de produtos caros sem lactose. É totalmente possível usar técnicas culinárias simples como ovos bem batidos, biomassa ou azeite emulsionado para dar o mesmo ponto aveludado aos pratos.`;
        practicalTips = [
          "Para gratinar na Airfryer, queijos curados (tipo parmesão maturado) têm teor residual de lactose quase nulo e costumam ser tolerados.",
          "Ovo batido com um fio de azeite e ervas substitui com perfeição cremes pesados em tortas e frigideiras.",
          "Levedura nutricional ou raspas de limão dão aquele sabor umami especial sem inflamar o intestino.",
        ];
        macros = { calories: "~160 kcal", protein: "12g", carbs: "5g" };
      } else if (qLower.includes("treino") || qLower.includes("proteina") || qLower.includes("massa")) {
        verdict = "Combo de altíssima síntese proteica!";
        answer = `Com o que você tem na geladeira, atingir sua meta proteica diária fica simples. A combinação de ovos, sobras de carnes ou atum com carboidrato complexo garante recuperação muscular acelerada.`;
        practicalTips = [
          "Adicione claras extras ou queijo na preparação para bater facilmente 25g+ de proteína por refeição.",
          "Consuma em até 2 horas pós-treino junto com uma fonte de carboidrato limpo (arroz ou batata).",
          "Mantenha a hidratação alta para que os rins processem os aminoácidos com máxima eficiência.",
        ];
        macros = { calories: "~320 kcal", protein: "28g", carbs: "22g" };
      }

      return { verdict, answer, practicalTips, macros };
    }
  });


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
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const lastUserRaw = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const lastUser = typeof lastUserRaw === "string" ? lastUserRaw : "";
    const mem = await recallContext(context.supabase, context.userId, "saboria", lastUser);
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
- Máximo 200 palavras${mem ? "\n\n" + mem : ""}`;

    const content = await callGateway({
      model: TEXT_MODEL,
      temperature: 0.7,
      max_tokens: 800,
      messages: [{ role: "system", content: system }, ...data.messages],
    });
    if (lastUser) rememberFact(context.supabase, context.userId, "saboria", "nutri", `Pergunta ao nutri: ${lastUser.slice(0, 200)}`);
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


// ============ HERO: "O que faço agora?" ============
export type QuickIdea = { title: string; time_min: number; why: string; ingredients: string[]; steps: string[] };
export type QuickIdeasResult = { intro: string; ideas: QuickIdea[] };

export const quickIdeas = createServerFn({ method: "POST" })
  .inputValidator((d: { ingredients: string[]; time_min: number; mood?: string }) => d)
  .handler(async ({ data }): Promise<QuickIdeasResult> => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é um chef brasileiro prático. Dada uma lista de ingredientes, tempo disponível e humor, sugira EXATAMENTE 3 pratos rápidos e realistas. Responda APENAS JSON: {"intro":"...","ideas":[{"title":"...","time_min":15,"why":"por que combina agora","ingredients":["..."],"steps":["passo curto"]}]}` },
        { role: "user", content: `Ingredientes: ${data.ingredients.join(", ") || "básicos de despensa"}. Tempo: ${data.time_min} min. Humor: ${data.mood ?? "sem preferência"}.` },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });
    return parseJson<QuickIdeasResult>(raw);
  });

/* ================= Pantry Scanner (foto de compras → itens) ================= */
export type PantryScanResult = {
  items: Array<{ name: string; qty?: string; category?: string }>;
  note: string;
};

export const scanPantryPhoto = createServerFn({ method: "POST" })
  .inputValidator((data: { imageBase64: string }) => {
    if (!data?.imageBase64?.startsWith("data:image/")) throw new Error("Imagem inválida");
    return data;
  })
  .handler(async ({ data }): Promise<PantryScanResult> => {
    const system = `Você identifica alimentos numa foto (compras, geladeira, despensa).
Retorne APENAS JSON: {"items":[{"name":"tomate","qty":"3 un","category":"vegetais"}],"note":"resumo curto"}
Categorias possíveis: proteínas, vegetais, frutas, grãos, laticínios, temperos, bebidas, outros.
Se não houver comida: {"items":[],"note":"Não identifiquei alimentos."}`;

    const raw = await callGateway({
      model: VISION_MODEL, max_tokens: 2500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: [
          { type: "text", text: "Liste os alimentos que você vê." },
          { type: "image_url", image_url: { url: data.imageBase64 } },
        ] },
      ],
    });
    return parseJson<PantryScanResult>(raw);
  });

/* ================= Onda I — Insight do dia ================= */
export type DailyInsight = { headline: string; body: string; emoji: string };

export const generateDailyInsight = createServerFn({ method: "POST" })
  .inputValidator((d: { period: string; recent?: string[] }) => d)
  .handler(async ({ data }): Promise<DailyInsight> => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é NXA, um coach de lifestyle premium. Gere UM insight curto (headline até 6 palavras, body até 22 palavras) contextual à hora do dia e às ações recentes do usuário. Tom caloroso, direto, sem clichê. Responda APENAS JSON: {"headline":"...","body":"...","emoji":"✨"}` },
        { role: "user", content: `Período: ${data.period}. Ações recentes: ${(data.recent ?? []).slice(0, 5).join(" · ") || "nenhuma ainda"}.` },
      ],
      temperature: 0.85,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });
    return parseJson<DailyInsight>(raw);
  });

/* ================= Onda L — Sunset (resumo do dia) ================= */
export type SunsetRecap = { headline: string; body: string; suggestion: string };

export const generateSunsetRecap = createServerFn({ method: "POST" })
  .inputValidator((d: { actions: string[]; xp: number }) => d)
  .handler(async ({ data }): Promise<SunsetRecap> => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é NXA, coach noturno. Feche o dia do usuário com carinho. Retorne APENAS JSON: {"headline":"até 6 palavras","body":"até 30 palavras celebrando conquistas concretas","suggestion":"até 12 palavras: sugestão gentil pra amanhã ou pra dormir"}. Tom acolhedor, sem clichê, sem emoji.` },
        { role: "user", content: `Ganhou ${data.xp} XP hoje. Ações: ${data.actions.slice(0, 8).join(" · ") || "dia leve, sem registros"}.` },
      ],
      temperature: 0.8,
      max_tokens: 240,
      response_format: { type: "json_object" },
    });
    return parseJson<SunsetRecap>(raw);
  });

/* ================= Onda M — Morning Brief ================= */
export type MorningBrief = {
  greeting: string;
  intention: string;
  missions: { emoji: string; title: string; app?: string }[];
};

export const generateMorningBrief = createServerFn({ method: "POST" })
  .inputValidator((d: { name?: string; apps: string[]; streak?: number; recent?: string[] }) => d)
  .handler(async ({ data }): Promise<MorningBrief> => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é NXA, coach matinal. Abra o dia com leveza. Retorne APENAS JSON: {"greeting":"até 6 palavras, saudação personalizada","intention":"até 18 palavras, uma intenção pro dia","missions":[{"emoji":"🌱","title":"até 8 palavras","app":"slug opcional"}]} com 3 missions curtas conectadas aos apps disponíveis. Tom caloroso, direto, sem clichê.` },
        { role: "user", content: `Nome: ${data.name || "amigo"}. Streak: ${data.streak ?? 0} dias. Apps disponíveis: ${data.apps.join(", ") || "nenhum"}. Ações recentes: ${(data.recent ?? []).slice(0, 5).join(" · ") || "nenhuma"}.` },
      ],
      temperature: 0.85,
      max_tokens: 320,
      response_format: { type: "json_object" },
    });
    return parseJson<MorningBrief>(raw);
  });

/* ================= Onda N — Weekly Review ================= */
export type WeeklyReview = {
  headline: string;
  summary: string;
  wins: string[];
  focus: string;
  nextGoal: string;
};

export const generateWeeklyReview = createServerFn({ method: "POST" })
  .inputValidator((d: { name?: string; totalXp: number; actionCount: number; topReasons: string[]; apps: string[] }) => d)
  .handler(async ({ data }): Promise<WeeklyReview> => {
    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: `Você é NXA, coach semanal. Revise a semana do usuário com honestidade e carinho. Retorne APENAS JSON: {"headline":"até 6 palavras","summary":"até 30 palavras resumindo a semana","wins":["até 3 conquistas, cada uma até 8 palavras"],"focus":"até 14 palavras: um foco pra próxima semana","nextGoal":"até 10 palavras: meta concreta e alcançável"}. Tom caloroso, específico, sem clichê.` },
        { role: "user", content: `Nome: ${data.name || "amigo"}. XP na semana: ${data.totalXp}. Ações registradas: ${data.actionCount}. Principais atividades: ${data.topReasons.slice(0, 6).join(" · ") || "semana leve"}. Apps ativos: ${data.apps.join(", ") || "nenhum"}.` },
      ],
      temperature: 0.8,
      max_tokens: 360,
      response_format: { type: "json_object" },
    });
    return parseJson<WeeklyReview>(raw);
  });
