import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

/**
 * Endpoint Público para Siri / Alexa / WhatsApp (Onda II)
 * Recebe comando de voz/texto e processa via Agente Global.
 */
export const Route = createFileRoute('/api/public/voice-command')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { text, userId, apiKey } = z.object({
            text: z.string(),
            userId: z.string(),
            apiKey: z.string().optional()
          }).parse(body)

          // Validação básica de API Key se necessário
          // if (apiKey !== process.env.GLOBAL_AGENTS_KEY) ...

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server")
          const { processGlobalCommand } = await import("@/lib/voice.server")

          const result = await processGlobalCommand(text, userId, supabaseAdmin)
          
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 400 })
        }
      }
    }
  }
})
