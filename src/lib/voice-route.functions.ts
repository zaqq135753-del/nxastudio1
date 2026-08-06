import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { callGateway, parseJson, TEXT_MODEL } from "./ai-shared";

const APPS_INDEX = [
  { slug: "saboria",   name: "NXA Chef",    route: "/apps/saboria",   about: "receitas, geladeira, planner alimentar, nutri" },
  { slug: "fitia",     name: "NXA Fit",     route: "/apps/fitia",     about: "treinos, exercícios, condicionamento" },
  { slug: "granaia",   name: "NXA Money",   route: "/apps/granaia",   about: "finanças, gastos, metas, orçamento" },
  { slug: "glowia",    name: "NXA Glow",    route: "/apps/glowia",    about: "skincare, rotina de pele, análise" },
  { slug: "petia",     name: "NXA Pet",     route: "/apps/petia",     about: "cuidados com pet, vet virtual, vacinas" },
  { slug: "socialia",  name: "NXA Social",  route: "/apps/socialia",  about: "posts, legendas, hashtags, calendário" },
  { slug: "fluencyia", name: "NXA Lingua",  route: "/apps/fluencyia", about: "aprender idiomas, conversar, vocabulário" },
  { slug: "styleia",   name: "NXA Style",   route: "/apps/styleia",   about: "estilo pessoal, looks, guarda-roupa" },
  { slug: "cosmosia",  name: "NXA Estudantil",  route: "/apps/cosmosia",  about: "ENEM, vestibulares, redação nota 1000, simulados, método feynman" },
  { slug: "roteiroia", name: "NXA Travel",  route: "/apps/roteiroia", about: "viagens, roteiros, destinos" },
];

const InputSchema = z.object({ transcript: z.string().min(1).max(1200) });

/** Roteia um comando de voz para o app + fala uma resposta curta. */
export const voiceRoute = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const sys = `Você é a NXA, uma assistente que direciona o usuário entre apps.
Apps disponíveis (slug — sobre):
${APPS_INDEX.map((a) => `- ${a.slug}: ${a.about}`).join("\n")}

Responda em JSON estrito:
{"reply": "1-2 frases em pt-BR falando com o usuário",
 "appSlug": "<um dos slugs OU null se conversa genérica>",
 "action": "sugestão curta do que fazer no app (ou null)"}`;

    const raw = await callGateway({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: data.transcript },
      ],
      max_tokens: 400,
      response_format: { type: "json_object" },
    });
    const j = parseJson<{ reply: string; appSlug: string | null; action: string | null }>(raw);
    const app = j.appSlug ? APPS_INDEX.find((a) => a.slug === j.appSlug) ?? null : null;
    return {
      reply: j.reply ?? "",
      appSlug: app?.slug ?? null,
      appName: app?.name ?? null,
      route: app?.route ?? null,
      action: j.action ?? null,
    };
  });
