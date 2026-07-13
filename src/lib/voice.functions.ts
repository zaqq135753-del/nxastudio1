import { createServerFn } from "@tanstack/react-start";

const OPENAI = "https://api.openai.com/v1";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function pickAuth() {
  const openai = process.env.OPENAI_API_KEY;
  if (openai) return { base: OPENAI, auth: `Bearer ${openai}`, model: (m: string) => m.replace(/^openai\//, "") };
  const lov = process.env.LOVABLE_API_KEY;
  if (!lov) throw new Error("OPENAI_API_KEY ou LOVABLE_API_KEY não configurada");
  return { base: GATEWAY, auth: `Bearer ${lov}`, model: (m: string) => m };
}

/** Transcreve áudio (base64). Usa OpenAI direto se OPENAI_API_KEY existir. */
export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((d: { audioBase64: string; mimeType: string }) => d)
  .handler(async ({ data }) => {
    const bin = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
    const ext =
      data.mimeType.includes("mp4") ? "mp4"
      : data.mimeType.includes("mpeg") ? "mp3"
      : data.mimeType.includes("wav") ? "wav"
      : "webm";
    const { base, auth, model } = pickAuth();
    const fd = new FormData();
    fd.append("file", new Blob([bin], { type: data.mimeType || "audio/webm" }), `rec.${ext}`);
    fd.append("model", model("openai/gpt-4o-mini-transcribe"));
    const res = await fetch(`${base}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: auth },
      body: fd,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      const tag = res.status === 402 ? "[NO_CREDITS]" : res.status === 429 ? "[RATE_LIMIT]" : "";
      throw new Error(`${tag} STT falhou (${res.status}) ${t.slice(0, 120)}`.trim());
    }
    const j = (await res.json()) as { text?: string };
    return { text: j.text ?? "" };
  });

/** Sintetiza fala; retorna base64 (mp3). Usa OpenAI direto se OPENAI_API_KEY existir. */
export const synthesizeSpeech = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; voice?: string }) => d)
  .handler(async ({ data }) => {
    const { base, auth, model } = pickAuth();
    const res = await fetch(`${base}/audio/speech`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model("openai/gpt-4o-mini-tts"),
        input: data.text.slice(0, 3500),
        voice: data.voice ?? "alloy",
        response_format: "mp3",
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      const tag = res.status === 402 ? "[NO_CREDITS]" : res.status === 429 ? "[RATE_LIMIT]" : "";
      throw new Error(`${tag} TTS falhou (${res.status}) ${t.slice(0, 120)}`.trim());
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
