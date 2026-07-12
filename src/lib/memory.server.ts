// Semantic memory helpers — server-only. Never import from client code.
// Prefer OpenAI direto (chave do usuário) quando OPENAI_API_KEY existe;
// caso contrário, cai para o Lovable AI Gateway.
const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/embeddings";
const OPENAI_URL = "https://api.openai.com/v1/embeddings";
const EMBED_MODEL_OPENAI = "text-embedding-3-small";
const EMBED_MODEL_LOVABLE = "openai/text-embedding-3-small";

export async function embed(text: string): Promise<number[] | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  const useOpenAI = !!openaiKey;
  const url = useOpenAI ? OPENAI_URL : LOVABLE_URL;
  const model = useOpenAI ? EMBED_MODEL_OPENAI : EMBED_MODEL_LOVABLE;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (useOpenAI) {
    headers["Authorization"] = `Bearer ${openaiKey}`;
  } else {
    if (!lovableKey) return null;
    headers["Lovable-API-Key"] = lovableKey;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, input: text.slice(0, 8000) }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}
