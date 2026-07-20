import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/whatsapp-webhook')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const mode = url.searchParams.get('hub.mode')
        const token = url.searchParams.get('hub.verify_token')
        const challenge = url.searchParams.get('hub.challenge')

        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
          return new Response(challenge, { status: 200 })
        }
        return new Response('Forbidden', { status: 403 })
      },
      POST: async ({ request }) => {
        // Placeholder para processamento de mensagens
        return new Response('ok', { status: 200 })
      }
    }
  }
})
