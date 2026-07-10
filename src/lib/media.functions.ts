import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway, parseJson, recallContext, TEXT_MODEL } from "./ai-shared";
import { z } from "zod";

const DocSchema = z.object({
  appSlug: z.string(),
  format: z.enum(["ebook", "pptx"]),
  topic: z.string().min(3).max(400),
  audience: z.string().optional(),
});

/**
 * Gera outline estruturado para ebook (capítulos) ou pptx (slides).
 * Retorna JSON: { title, subtitle, sections: [{ heading, body, bullets? }] }
 */
export const generateDocOutline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DocSchema.parse(d))
  .handler(async ({ data, context }) => {
    const ctx = await recallContext(context.supabase, context.userId, data.appSlug, data.topic, 4);
    const isPptx = data.format === "pptx";
    const targetCount = isPptx ? "8 a 10 slides" : "6 a 8 capítulos";

    const system = `Você é um redator profissional gerando um ${isPptx ? "deck de slides" : "ebook curto"} em português brasileiro no domínio "${data.appSlug}". Seja específico, prático e evite generalidades. Contexto do usuário (memórias): ${ctx || "sem contexto adicional"}.`;
    const user = `Tema: "${data.topic}"${data.audience ? `. Público-alvo: ${data.audience}` : ""}.

Gere um JSON estritamente neste formato (sem markdown, sem cercas):
{
  "title": "título curto e impactante (máx 60 chars)",
  "subtitle": "subtítulo em 1 linha",
  "sections": [
    { "heading": "título da ${isPptx ? "slide" : "seção"}", "body": "parágrafo de 2-4 frases", "bullets": ["ponto 1", "ponto 2", "ponto 3"] }
  ]
}

Regras:
- ${targetCount}.
- ${isPptx ? "Cada slide: heading curto (máx 8 palavras), body de 1-2 frases, 3-4 bullets objetivos." : "Cada capítulo: heading claro, body com 3-5 frases explicativas, 3-5 bullets acionáveis."}
- Primeira seção é introdução, última é conclusão/próximos passos.
- Nada de emojis nos títulos, texto profissional.`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: 3500,
      response_format: { type: "json_object" },
    });

    const parsed = parseJson<{
      title: string;
      subtitle?: string;
      sections: { heading: string; body: string; bullets?: string[] }[];
    }>(raw);

    if (!parsed?.sections?.length) {
      throw new Error("A IA não retornou seções válidas. Tente refinar o tema.");
    }
    return parsed;
  });

const TtsSchema = z.object({
  text: z.string().min(1).max(3500),
  voice: z.string().default("alloy"),
  styleHint: z.string().optional(),
});

/**
 * TTS com voz de marca (usa gateway openai/gpt-4o-mini-tts).
 * Retorna base64 mp3.
 */
export const brandTTS = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TtsSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurada");
    const input = data.styleHint ? `${data.styleHint}\n\n${data.text}` : data.text;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input,
        voice: data.voice,
        response_format: "mp3",
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`TTS falhou: ${res.status} ${t.slice(0, 200)}`);
    }
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return { audioBase64: btoa(bin), mimeType: "audio/mpeg" };
  });
