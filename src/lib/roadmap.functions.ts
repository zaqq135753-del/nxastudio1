import { createServerFn } from "@tanstack/react-start";

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
        status: "completed",
        tasks: ["Sugestões Preditivas", "ROI Dashboard", "Global Analytics"]
      },
      {
        id: "mvp-launch",
        title: "Entrega Final MVP",
        status: "completed",
        tasks: ["InfinitePay Webhooks", "Onboarding Per-App Concluído", "Polimento Visual Final"]
      }
    ];
  });
