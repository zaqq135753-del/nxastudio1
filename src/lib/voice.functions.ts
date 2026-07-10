import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function key(): string {
  const k = process.env.LOVABLE_API_KEY;
  if (!k) throw new Error("LOVABLE_API_KEY não configurada");
  return k;
}

/** Transcreve áudio (base64) usando Lovable AI Gateway (openai/gpt-4o-mini-transcribe). */
export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((d: { audioBase64: string; mimeType: string }) => d)
  .handler(async ({ data }) => {
    const bin = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
    const ext =
      data.mimeType.includes("mp4") ? "mp4"
      : data.mimeType.includes("mpeg") ? "mp3"
      : data.mimeType.includes("wav") ? "wav"
      : "webm";
    const fd = new FormData();
    fd.append("file", new Blob([bin], { type: data.mimeType || "audio/webm" }), `rec.${ext}`);
    fd.append("model", "openai/gpt-4o-mini-transcribe");
    const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}` },
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

/** Sintetiza fala; retorna base64 (mp3). */
export const synthesizeSpeech = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; voice?: string }) => d)
  .handler(async ({ data }) => {
    const res = await fetch(`${GATEWAY}/audio/speech`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
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
    // btoa on chunks to avoid stack overflow
    const bytes = new Uint8Array(buf);
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return { audioBase64: btoa(bin), mimeType: "audio/mpeg" };
  });
