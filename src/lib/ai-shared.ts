// Shared AI helpers used by all IA apps in the suite.
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
export const TEXT_MODEL = "openai/gpt-5-mini";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Roteamento inteligente:
 * - Se model começa com "openai/" E OPENAI_API_KEY existe → chama OpenAI direto (usa sua chave/créditos).
 * - Caso contrário → passa pelo Lovable AI Gateway.
 */
export async function callGateway(body: {
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
    const txt = await res.text();
    if (res.status === 429) throw new Error("Muitas requisições. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados.");
    if (res.status === 401 && useOpenAI) throw new Error("OPENAI_API_KEY inválida.");
    throw new Error(`Erro da IA: ${res.status} ${txt.slice(0, 200)}`);
  }
  const j = await res.json();
  return j.choices?.[0]?.message?.content ?? "";
}


function balance(s: string): string {
  let inStr = false, esc = false;
  const stack: string[] = [];
  for (const c of s) {
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") stack.pop();
  }
  let out = s;
  if (inStr) out += '"';
  while (stack.length) out += stack.pop() === "{" ? "}" : "]";
  return out;
}

export function parseJson<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const sanitized = slice
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/,\s*([}\]])/g, "$1");
  for (const attempt of [slice, sanitized, balance(sanitized)]) {
    try { return JSON.parse(attempt) as T; } catch { /* try next */ }
  }
  console.error("[parseJson] inválido:", raw.slice(0, 600));
  throw new Error("A IA retornou uma resposta inválida. Tente novamente.");
}

/* ============ Semantic memory helpers (best-effort) ============
 * Uso: em qualquer .functions.ts com requireSupabaseAuth, chame
 *   const mem = await recallContext(context.supabase, context.userId, "saboria", userQuery);
 *   // prepend `mem` no system prompt se não vazio
 *   // depois:
 *   rememberFact(context.supabase, context.userId, "saboria", "receita", `Gostou de ${parsed.name}`);
 */
type SB = { rpc: (...a: unknown[]) => Promise<{ data: unknown; error: unknown }>; from: (t: string) => { insert: (v: unknown) => Promise<unknown> } };

export async function recallContext(
  supabase: unknown,
  userId: string,
  appSlug: string,
  query: string,
  limit = 5,
): Promise<string> {
  try {
    const { embed } = await import("./memory.server");
    const vec = await embed(query);
    if (!vec) return "";
    const sb = supabase as SB;
    const { data } = await sb.rpc("match_user_memories", {
      _user_id: userId,
      _query_embedding: vec as unknown,
      _app_slugs: [appSlug, "cross"],
      _match_count: limit,
    });
    const rows = (data as Array<{ content: string; similarity: number }> | null) ?? [];
    if (!rows.length) return "";
    return "Contexto do usuário (memória de longo prazo):\n" + rows.map((r) => `- ${r.content}`).join("\n");
  } catch {
    return "";
  }
}

export function rememberFact(
  supabase: unknown,
  userId: string,
  appSlug: string,
  kind: string,
  content: string,
  metadata: Record<string, unknown> = {},
): void {
  // best-effort, não bloqueia o retorno do handler
  (async () => {
    try {
      const { embed } = await import("./memory.server");
      const vec = await embed(`${kind}: ${content}`);
      const sb = supabase as SB;
      await sb.from("user_memories").insert({
        user_id: userId,
        app_slug: appSlug,
        kind,
        content: content.slice(0, 4000),
        embedding: vec as unknown,
        metadata,
      });
    } catch {
      /* silencioso */
    }
  })();
}
