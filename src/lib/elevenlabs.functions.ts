/**
 * ElevenLabs Realtime Voice — servidor.
 * Emite conversation tokens (WebRTC) usando ELEVENLABS_API_KEY do connector.
 * Cada app tem seu próprio agent id no ElevenLabs (env `ELEVENLABS_AGENT_<SLUG>`).
 */
import { createServerFn } from "@tanstack/react-start";

const AGENT_ENV_PREFIX = "ELEVENLABS_AGENT_";

export function getElevenlabsAgentId(slug: string): string | null {
  const key = `${AGENT_ENV_PREFIX}${slug.toUpperCase()}`;
  const v = process.env[key];
  return v && v.trim() ? v.trim() : null;
}

export const getElevenlabsCallToken = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("[ELEVENLABS_MISSING_KEY] ElevenLabs não está conectado ainda.");
    }
    const agentId = getElevenlabsAgentId(data.slug);
    if (!agentId) {
      throw new Error(`[ELEVENLABS_NO_AGENT] Agent não configurado para ${data.slug}. Crie um no painel ElevenLabs e salve o id em ELEVENLABS_AGENT_${data.slug.toUpperCase()}.`);
    }
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { "xi-api-key": apiKey } },
    );
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`ElevenLabs token falhou (${res.status}) ${t.slice(0, 160)}`);
    }
    const j = (await res.json()) as { token?: string };
    if (!j.token) throw new Error("ElevenLabs não retornou token");
    return { token: j.token, agentId };
  });

/** Retorna quais apps têm agent configurado (para esconder o botão nos demais). */
export const listElevenlabsAgents = createServerFn({ method: "GET" }).handler(async () => {
  const slugs = ["fluencyia", "saboria", "petia", "fitia", "glowia", "granaia", "styleia", "cosmosia", "roteiroia", "socialia"];
  const configured: Record<string, boolean> = {};
  for (const s of slugs) configured[s] = !!getElevenlabsAgentId(s);
  return { configured, hasKey: !!process.env.ELEVENLABS_API_KEY };
});
