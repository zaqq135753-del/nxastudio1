// Copy central da plataforma — mensagens amigáveis, sem termos técnicos.
// Substitui erros crus como "A IA retornou uma resposta inválida" por texto humano.

export const COPY = {
  errors: {
    aiInvalid: "Ainda estou preparando suas sugestões. Toque em atualizar em alguns segundos.",
    aiTimeout: "Demorou mais do que o normal. Tente novamente.",
    aiGeneric: "Não consegui gerar agora. Tente de novo.",
    aiNoCredits: "Sua cota de IA acabou por hoje. Volta amanhã ou ative Prime.",
    aiRate: "Muitas requisições em pouco tempo. Aguarde um instante.",
    network: "Sem conexão agora. Verifique sua internet.",
    generic: "Algo saiu do esperado. Tente novamente.",
  },
  empty: {
    stats: "Comece a usar e seus dados aparecem aqui.",
    list: "Nada por aqui ainda.",
    save: "Nenhum item salvo. Toque em salvar para começar sua coleção.",
    memory: "Sua memória com este app começa depois do primeiro uso.",
    media: "Exportações em PDF, PPTX e áudio aparecem aqui.",
    notifications: "Sem lembretes agora — tudo em dia.",
  },
  cta: {
    helpNow: "Me ajuda agora",
    startTrial: "Começar teste grátis",
    upgradePrime: "Adicionar Prime",
    keepBase: "Continuar sem Prime",
    export: "Exportar em PDF",
    callAI: "Ligar com a IA",
    refresh: "Atualizar sugestões",
  },
  status: {
    trial: "Trial ativo",
    prime: "Prime ativo",
    base: "Plano ativo",
    locked: "Bloqueado",
    available: "Disponível",
  },
};

export function friendlyAiError(raw: unknown): string {
  const msg = raw instanceof Error ? raw.message : String(raw ?? "");
  const low = msg.toLowerCase();
  if (low.includes("créditos") || low.includes("402")) return COPY.errors.aiNoCredits;
  if (low.includes("muitas requisi") || low.includes("429")) return COPY.errors.aiRate;
  if (low.includes("resposta inválida") || low.includes("json")) return COPY.errors.aiInvalid;
  if (low.includes("timeout") || low.includes("abort")) return COPY.errors.aiTimeout;
  if (low.includes("fetch") || low.includes("network")) return COPY.errors.network;
  if (!msg) return COPY.errors.aiGeneric;
  // fallback: mensagem original só se já vier em português amigável
  return /[^\x00-\x7F]/.test(msg) ? msg : COPY.errors.aiGeneric;
}
