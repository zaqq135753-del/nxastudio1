// Onda 2 — camada visual por app (emoji, tema CSS, missão diária, títulos).
// Sem tocar em AppConfig existente: qualquer consumidor lê via getAppVisual(slug)
// e pode ignorar sem quebrar.

export type AppVisual = {
  slug: string;
  /** Slug curto usado nas classes CSS `.app-<theme>` de src/styles.css */
  theme:
    | "chef" | "social" | "pet" | "fluency" | "glow"
    | "grana" | "fit" | "style" | "cosmos" | "travel";
  emoji: string;
  emojiSet: [string, string, string, string];
  mission: {
    title: string;      // "🍳 Missão de hoje"
    headline: string;   // "Resolver seu jantar com o que você já tem."
    cta: string;        // "Cozinhar agora"
    to: string;         // rota da missão
    badge?: string;     // "Hoje" | "Agora" | "PDF" | "Novo"
  };
  card: {
    title: string;      // "Resolver jantar"
    subtitle: string;   // "Receitas com o que você já tem"
    badge?: string;
  };
  sectionTitles?: {
    quick?: string;
    progress?: string;
    prime?: string;
    history?: string;
    start?: string;
  };
};

const DEFAULT_SECTIONS = {
  start: "Comece por aqui",
  quick: "Ações rápidas",
  progress: "Seu progresso",
  prime: "Modo Prime",
  history: "Histórico recente",
};

const V: Record<string, AppVisual> = {
  saboria: {
    slug: "saboria", theme: "chef",
    emoji: "🍳", emojiSet: ["🍳", "🥗", "🛒", "🔥"],
    mission: {
      title: "🍳 Missão de hoje",
      headline: "Resolver seu jantar com o que você já tem.",
      cta: "Cozinhar agora",
      to: "/apps/saboria/agora",
      badge: "Hoje",
    },
    card: { title: "Resolver jantar", subtitle: "Receitas com o que você já tem", badge: "Hoje" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  socialia: {
    slug: "socialia", theme: "social",
    emoji: "📱", emojiSet: ["📱", "✨", "🚀", "#️⃣"],
    mission: {
      title: "📱 Missão de hoje",
      headline: "Criar um post que você consiga publicar agora.",
      cta: "Criar post",
      to: "/apps/socialia/gerador",
      badge: "Novo",
    },
    card: { title: "Postar hoje", subtitle: "Legenda, ideia e roteiro", badge: "Novo" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  petia: {
    slug: "petia", theme: "pet",
    emoji: "🐾", emojiSet: ["🐾", "🐶", "🐱", "🩺"],
    mission: {
      title: "🐾 Missão de hoje",
      headline: "Checar seu pet em 1 minuto — comida, humor e saúde.",
      cta: "Cuidar agora",
      to: "/apps/petia/chat",
    },
    card: { title: "Cuidar do pet", subtitle: "Chat vet, triagem e alimentação" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  fluencyia: {
    slug: "fluencyia", theme: "fluency",
    emoji: "🌍", emojiSet: ["🌍", "🗣️", "📚", "🎧"],
    mission: {
      title: "🌍 Missão de hoje",
      headline: "15 minutos praticando uma situação real.",
      cta: "Praticar agora",
      to: "/apps/fluencyia/conversar",
    },
    card: { title: "Praticar idioma", subtitle: "Conversa, pronúncia e vocab" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  glowia: {
    slug: "glowia", theme: "glow",
    emoji: "✨", emojiSet: ["✨", "🧴", "🌞", "💧"],
    mission: {
      title: "✨ Missão de hoje",
      headline: "Sua rotina AM/PM em 2 minutos — sem esquecer o SPF.",
      cta: "Ver rotina",
      to: "/apps/glowia/rotina",
    },
    card: { title: "Skincare do dia", subtitle: "Rotina + análise por foto" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  granaia: {
    slug: "granaia", theme: "grana",
    emoji: "💰", emojiSet: ["💰", "📊", "🧾", "🎯"],
    mission: {
      title: "💰 Missão de hoje",
      headline: "Descobrir se essa compra cabe no seu mês.",
      cta: "Analisar compra",
      to: "/apps/granaia/comprar",
      badge: "Útil",
    },
    card: { title: "Posso comprar?", subtitle: "Análise em 5 segundos", badge: "Útil" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  fitia: {
    slug: "fitia", theme: "fit",
    emoji: "💪", emojiSet: ["💪", "⚡", "🏋️", "🔥"],
    mission: {
      title: "💪 Missão de hoje",
      headline: "Treinar de acordo com sua energia de hoje.",
      cta: "Começar treino",
      to: "/apps/fitia/hoje",
      badge: "Agora",
    },
    card: { title: "Treino de hoje", subtitle: "Adaptado à sua energia", badge: "Agora" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  styleia: {
    slug: "styleia", theme: "style",
    emoji: "👗", emojiSet: ["👗", "🧥", "✨", "🛍️"],
    mission: {
      title: "👗 Missão de hoje",
      headline: "Um look pronto para o compromisso de hoje.",
      cta: "Gerar look",
      to: "/apps/styleia/look",
    },
    card: { title: "Look do dia", subtitle: "Com as peças que você tem" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  cosmosia: {
    slug: "cosmosia", theme: "cosmos",
    emoji: "🌌", emojiSet: ["🌌", "🔮", "🌙", "✨"],
    mission: {
      title: "🌌 Missão de hoje",
      headline: "Sua leitura personalizada do dia.",
      cta: "Ver leitura",
      to: "/apps/cosmosia/tarot",
    },
    card: { title: "Leitura de hoje", subtitle: "Tarot, mapa e ritual" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  roteiroia: {
    slug: "roteiroia", theme: "travel",
    emoji: "✈️", emojiSet: ["✈️", "🧳", "🗺️", "🌦️"],
    mission: {
      title: "✈️ Missão de hoje",
      headline: "Montar um roteiro completo com plano B.",
      cta: "Criar roteiro",
      to: "/apps/roteiroia/criar",
      badge: "PDF",
    },
    card: { title: "Criar roteiro", subtitle: "Dias, orçamento e plano B", badge: "PDF" },
    sectionTitles: DEFAULT_SECTIONS,
  },
  studyia: {
    slug: "studyia", theme: "glow",
    emoji: "🎓", emojiSet: ["🎓", "✍️", "🧠", "🎯"],
    mission: {
      title: "🎓 Missão de hoje",
      headline: "Enviar 1 redação manuscrita para atingir 900+ no ENEM.",
      cta: "Treinar redação",
      to: "/apps/studyia/redacao",
      badge: "Agora",
    },
    card: { title: "Treinar redação", subtitle: "Correção por foto instantânea", badge: "Agora" },
    sectionTitles: DEFAULT_SECTIONS,
  },
};

export function getAppVisual(slug: string | undefined | null): AppVisual | undefined {
  if (!slug) return undefined;
  return V[slug];
}

export const APP_VISUALS: AppVisual[] = Object.values(V);

/** Retorna a className `app-<theme>` do slug (ou string vazia). */
export function appThemeClass(slug: string | undefined | null): string {
  const v = getAppVisual(slug);
  return v ? `app-${v.theme}` : "";
}
