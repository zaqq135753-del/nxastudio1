import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type FunnelEvent = {
  sessionId: string;
  eventType: "page_view" | "scroll_depth" | "sim_generate" | "recipe_expand" | "nutri_message" | "checkout_click" | "exit";
  section?: string;
  metadata?: Record<string, any>;
  timestamp: number;
};

// Armazenamento em memória no servidor (garante funcionamento mesmo sem tabela configurada)
// e sincronização silenciosa com Supabase se a tabela existir
const inMemoryEvents: FunnelEvent[] = [];
const MAX_EVENTS = 5000;

export const recordFunnelEvent = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z.object({
      sessionId: z.string(),
      eventType: z.enum([
        "page_view",
        "scroll_depth",
        "sim_generate",
        "recipe_expand",
        "nutri_message",
        "checkout_click",
        "exit",
      ]),
      section: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const event: FunnelEvent = {
      ...data,
      timestamp: Date.now(),
    };

    inMemoryEvents.push(event);
    if (inMemoryEvents.length > MAX_EVENTS) {
      inMemoryEvents.shift();
    }

    // Tenta persistir no Supabase em segundo plano
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await (supabaseAdmin as any)
        .from("funnel_events")
        .insert({
          session_id: event.sessionId,
          event_type: event.eventType,
          section: event.section,
          metadata: event.metadata,
          created_at: new Date(event.timestamp).toISOString(),
        })
        .then(() => null, () => null);
    } catch {
      // Silencioso caso tabela ainda não exista no Supabase
    }

    return { ok: true };
  });

export type FunnelMetrics = {
  totalVisitors: number;
  scroll25: number;
  scroll50: number;
  scroll75: number;
  scroll100: number;
  simGenerations: number;
  recipeExpands: number;
  nutriMessages: number;
  checkoutClicks: number;
  checkoutClicksByCta: Record<string, number>;
  topIngredients: Array<{ name: string; count: number }>;
  dropoffStage: {
    heroBounce: number;
    afterSim: number;
    beforeCheckout: number;
  };
  recentEvents: FunnelEvent[];
};

export const getFunnelMetrics = createServerFn({ method: "GET" })
  .handler(async () => {
    // Agrupa por sessionId para métricas de funil reais
    const sessions = new Map<string, FunnelEvent[]>();
    for (const ev of inMemoryEvents) {
      const list = sessions.get(ev.sessionId) ?? [];
      list.push(ev);
      sessions.set(ev.sessionId, list);
    }

    const totalVisitors = sessions.size;
    let scroll25 = 0;
    let scroll50 = 0;
    let scroll75 = 0;
    let scroll100 = 0;
    let simGenerations = 0;
    let recipeExpands = 0;
    let nutriMessages = 0;
    let checkoutClicks = 0;
    const checkoutClicksByCta: Record<string, number> = {};
    const ingredientCounts: Record<string, number> = {};

    for (const ev of inMemoryEvents) {
      if (ev.eventType === "scroll_depth") {
        const depth = ev.metadata?.depth;
        if (depth >= 25) scroll25++;
        if (depth >= 50) scroll50++;
        if (depth >= 75) scroll75++;
        if (depth >= 100) scroll100++;
      } else if (ev.eventType === "sim_generate") {
        simGenerations++;
        const ing = ev.metadata?.ingredients;
        if (Array.isArray(ing)) {
          for (const item of ing) {
            ingredientCounts[item] = (ingredientCounts[item] || 0) + 1;
          }
        }
      } else if (ev.eventType === "recipe_expand") {
        recipeExpands++;
      } else if (ev.eventType === "nutri_message") {
        nutriMessages++;
      } else if (ev.eventType === "checkout_click") {
        checkoutClicks++;
        const cta = ev.metadata?.cta ?? "desconhecido";
        checkoutClicksByCta[cta] = (checkoutClicksByCta[cta] || 0) + 1;
      }
    }

    const topIngredients = Object.entries(ingredientCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalVisitors: Math.max(totalVisitors, 1),
      scroll25,
      scroll50,
      scroll75,
      scroll100,
      simGenerations,
      recipeExpands,
      nutriMessages,
      checkoutClicks,
      checkoutClicksByCta,
      topIngredients,
      dropoffStage: {
        heroBounce: Math.max(0, totalVisitors - scroll25),
        afterSim: Math.max(0, simGenerations - checkoutClicks),
        beforeCheckout: Math.max(0, scroll75 - checkoutClicks),
      },
      recentEvents: inMemoryEvents.slice(-25).reverse(),
    };
  });
