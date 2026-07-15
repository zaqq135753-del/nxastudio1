import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook InfinitePay — recebe notificações de pagamento.
 * URL pública:
 *   https://nxastudio.lovable.app/api/public/infinitepay-webhook
 *
 * Configure no painel da InfinitePay > Checkout > Depois do pagamento > URL do Webhook.
 * Defina o secret `INFINITEPAY_WEBHOOK_SECRET` em Lovable Cloud para validar chamadas
 * (a InfinitePay envia via header `x-signature` ou campo `signature` no payload — ajuste
 * abaixo conforme a documentação atual deles).
 */
export const Route = createFileRoute("/api/public/infinitepay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const secret = process.env.INFINITEPAY_WEBHOOK_SECRET;

        // Validação de assinatura (opcional mas recomendado)
        if (secret) {
          const provided =
            request.headers.get("x-signature") ??
            request.headers.get("x-infinitepay-signature") ??
            "";
          if (!provided) {
            return new Response("Missing signature", { status: 401 });
          }
          // InfinitePay costuma usar HMAC-SHA256 do body com o secret.
          const { createHmac, timingSafeEqual } = await import("crypto");
          const expected = createHmac("sha256", secret).update(raw).digest("hex");
          const a = Buffer.from(provided);
          const b = Buffer.from(expected);
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return new Response("Invalid signature", { status: 401 });
          }
        }

        let payload: any = {};
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // Ex.: { event: "payment.approved", data: { customer_email, amount, external_id, ... } }
        const event = payload?.event ?? payload?.type ?? "unknown";
        const data = payload?.data ?? payload;

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Log bruto (crie a tabela `webhook_events` se quiser auditar).
          await (supabaseAdmin as any)
            .from("webhook_events")
            .insert({ provider: "infinitepay", event, payload })
            .then(() => null, () => null); // silencioso caso tabela não exista ainda

          // Marca compra ativa quando aprovado.
          if (event.includes("approved") || event.includes("paid")) {
            const email = data?.customer?.email ?? data?.customer_email;
            const appSlug = data?.metadata?.app_slug ?? data?.external_id;
            if (email && appSlug) {
              const { data: user } = await (supabaseAdmin as any).auth.admin
                .listUsers({ page: 1, perPage: 200 })
                .then((r: any) => ({
                  data: r.data?.users?.find((u: any) => u.email === email),
                }));
              if (user?.id) {
                await (supabaseAdmin as any).from("app_entitlements").upsert(
                  {
                    user_id: user.id,
                    app_slug: appSlug,
                    tier: data?.metadata?.tier ?? "base",
                    status: "active",
                    source: "infinitepay",
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id,app_slug" },
                );
              }
            }
          }
        } catch (err) {
          console.error("[infinitepay-webhook] handler error", err);
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
      GET: async () =>
        new Response("InfinitePay webhook endpoint. Use POST.", { status: 200 }),
    },
  },
});
