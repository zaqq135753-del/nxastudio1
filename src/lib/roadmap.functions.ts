import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getMVPRoadmap = createServerFn({ method: "GET" })
  .handler(async () => {
    return [
      {
        id: "core-stability",
        title: "Estabilidade do Core",
        status: "completed",
        tasks: ["Auth Multi-provedor", "Entitlements Engine", "Paywall Logic"]
      },
      {
        id: "ai-orchestration",
        title: "Orquestração IA (Onda II)",
        status: "completed",
        tasks: ["Voice Assistant", "Omnichannel API", "Pulse Hub"]
      },
      {
        id: "predictive-ui",
        title: "Inteligência Global (Onda III)",
        status: "in-progress",
        tasks: ["Sugestões Preditivas", "ROI Dashboard", "Global Analytics"]
      },
      {
        id: "mvp-launch",
        title: "Entrega Final MVP",
        status: "in-progress",
        tasks: ["InfinitePay Webhooks", "Onboarding Per-App Concluído", "Polimento Visual Final"]
      }
    ];
  });
