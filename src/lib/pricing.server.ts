import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function seedAppPricing() {
  const apps = [
    { slug: 'saboria', base: 29.90, prime: 69.90 },
    { slug: 'fitia', base: 34.90, prime: 79.90 },
    { slug: 'granaia', base: 39.90, prime: 89.90 },
    { slug: 'petia', base: 24.90, prime: 59.90 },
    { slug: 'fluencyia', base: 49.90, prime: 99.90 },
    { slug: 'glowia', base: 29.90, prime: 69.90 },
    { slug: 'styleia', base: 34.90, prime: 74.90 },
    { slug: 'socialia', base: 44.90, prime: 94.90 },
    { slug: 'cosmosia', base: 19.90, prime: 49.90 },
    { slug: 'roteiroia', base: 24.90, prime: 59.90 }
  ];

  for (const app of apps) {
    await supabaseAdmin
      .from('app_pricing_overrides')
      .upsert({ 
        app_slug: app.slug, 
        base_monthly: app.base, 
        prime_monthly: app.prime,
        updated_at: new Date().toISOString()
      }, { onConflict: 'app_slug' });
  }
}
