import { createFileRoute } from '@tanstack/react-router'
import { seedAppPricing } from '@/lib/pricing.server'

export const Route = createFileRoute('/api/public/seed-pricing')({
  server: {
    handlers: {
      GET: async () => {
        try {
          await seedAppPricing();
          return new Response('Preços configurados com sucesso!', { status: 200 })
        } catch (error) {
          console.error('Erro ao configurar preços:', error);
          return new Response('Erro ao configurar preços: ' + (error as Error).message, { status: 500 })
        }
      }
    }
  }
})
