// Per-app editorial landing content used by /assinar/$slug

export type AppLanding = {
  edition: string;        // small edition tag
  titleLead: string;      // main headline (before accent)
  titleAccent: string;    // italic accent word
  titleTail?: string;     // trailing text after accent
  subtitle: string;       // description under headline
  bullets: string[];      // 3 quick benefits
  footerTag: string;      // small footer note
  authTitle?: string;     // right column heading override
  authCopy?: string;      // right column paragraph override
};

const DEFAULT_FOOTER = "✨ Feito com IA · NXA Studio · 2026";

export const LANDINGS: Record<string, AppLanding> = {
  saboria: {
    edition: "NXA Chef · Edição nº 001",
    titleLead: "O sabor",
    titleAccent: "seu",
    titleTail: ".",
    subtitle:
      "A primeira IA que aprende seu paladar, sua rotina e o que tem hoje na sua geladeira — e cozinha junto com você.",
    bullets: [
      "Receitas em 4 segundos com o que você já tem",
      "Plano semanal que respeita restrições e orçamento",
      "Nutri virtual 24h por voz ou texto",
    ],
    footerTag: "🍳 Cozinhando com inteligência desde 2026",
  },
  socialia: {
    edition: "NXA Social · Edição nº 002",
    titleLead: "A voz",
    titleAccent: "sua",
    titleTail: ".",
    subtitle:
      "Uma IA que escreve, agenda e analisa o seu conteúdo — do briefing ao post pronto, no seu tom.",
    bullets: [
      "Legendas e ideias em segundos, no seu tom",
      "Calendário editorial que se adapta ao seu nicho",
      "Análise de perfil e hashtags com métricas",
    ],
    footerTag: "📣 Publicando com inteligência desde 2026",
  },
  petia: {
    edition: "NXA Pet · Edição nº 003",
    titleLead: "O cuidado",
    titleAccent: "dele",
    titleTail: ".",
    subtitle:
      "Um veterinário virtual 24h que conhece o seu pet — saúde, comida, treino e triagem de sintomas guiados por IA.",
    bullets: [
      "Chat vet 24h para dúvidas do dia a dia",
      "Plano alimentar e treino personalizados",
      "Triagem de sintomas em segundos",
    ],
    footerTag: "🐾 Cuidando com inteligência desde 2026",
  },
  fluencyia: {
    edition: "NXA Lingua · Edição nº 004",
    titleLead: "A fluência",
    titleAccent: "sua",
    titleTail: ".",
    subtitle:
      "Converse com uma IA que corrige seu sotaque, monta seu vocabulário e evolui no seu ritmo — em qualquer idioma.",
    bullets: [
      "Conversas reais com correção em tempo real",
      "Vocabulário adaptativo pro seu nível",
      "Progresso diário sem enrolação",
    ],
    footerTag: "🗣️ Aprendendo com inteligência desde 2026",
  },
  glowia: {
    edition: "NXA Glow · Edição nº 005",
    titleLead: "A pele",
    titleAccent: "sua",
    titleTail: ".",
    subtitle:
      "Fotografe a pele, receba um diagnóstico completo e uma rotina AM/PM feita pra ela — com dermato virtual a um chat.",
    bullets: [
      "Análise de pele por foto em segundos",
      "Rotina AM/PM personalizada",
      "Dermato virtual 24h por chat",
    ],
    footerTag: "🌸 Cuidando da pele com inteligência desde 2026",
  },
  granaia: {
    edition: "NXA Money · Edição nº 006",
    titleLead: "O dinheiro",
    titleAccent: "seu",
    titleTail: ".",
    subtitle:
      "Uma IA que lê seus extratos, entende seus gastos e conversa com você como um consultor financeiro — sem julgamento.",
    bullets: [
      "OCR de comprovantes e extratos",
      "Orçamento inteligente que se adapta",
      "Consultor IA 24h por chat",
    ],
    footerTag: "💸 Organizando com inteligência desde 2026",
  },
  fitia: {
    edition: "NXA Fit · Edição nº 007",
    titleLead: "O treino",
    titleAccent: "seu",
    titleTail: ".",
    subtitle:
      "Um personal virtual que monta treinos de verdade, conversa com você entre séries e acompanha cada evolução.",
    bullets: [
      "Treinos personalizados por objetivo",
      "Coach IA por chat durante o treino",
      "Histórico e progresso automáticos",
    ],
    footerTag: "🏋️ Treinando com inteligência desde 2026",
  },
  styleia: {
    edition: "NXA Style · Edição nº 008",
    titleLead: "O estilo",
    titleAccent: "seu",
    titleTail: ".",
    subtitle:
      "Fotografe seu armário, receba looks do dia feitos pela IA e um personal shopper que só sugere o que combina com você.",
    bullets: [
      "Armário digital com foto das peças",
      "Look do dia pensado pra sua agenda",
      "Personal shopper IA sem gastar demais",
    ],
    footerTag: "👗 Vestindo com inteligência desde 2026",
  },
  cosmosia: {
    edition: "NXA Estudantil · Edição nº 009",
    titleLead: "A aprovação",
    titleAccent: "sua",
    titleTail: ".",
    subtitle:
      "Correção de redação instantânea com nota por competência, modelos coringa e tutor 24h — com uma IA que estuda com você.",
    bullets: [
      "Correção de redação em segundos com nota de 0 a 1000",
      "Modelos de redação coringa prontos pra aplicar",
      "Tutor de exatas, humanas e biológicas 24h por chat",
    ],
    footerTag: "🎓 Estudando com inteligência desde 2026",
  },
  roteiroia: {
    edition: "NXA Travel · Edição nº 010",
    titleLead: "A viagem",
    titleAccent: "sua",
    titleTail: ".",
    subtitle:
      "Uma IA agente de viagens que monta roteiros dia-a-dia, cabe no seu bolso e conversa sobre qualquer destino.",
    bullets: [
      "Roteiro completo dia-a-dia em minutos",
      "Estimativa de orçamento por viagem",
      "Chat de destinos com dicas locais",
    ],
    footerTag: "✈️ Explorando com inteligência desde 2026",
  },
};

export function getLanding(slug: string, fallback: { name: string; tagline: string; description: string }): AppLanding {
  const l = LANDINGS[slug];
  if (l) return l;
  return {
    edition: `${fallback.name} · Novo`,
    titleLead: fallback.name.replace(/^NXA\s+/, ""),
    titleAccent: "seu",
    titleTail: ".",
    subtitle: fallback.description,
    bullets: [fallback.tagline, "Feito com IA de ponta", "Cancele quando quiser"],
    footerTag: DEFAULT_FOOTER,
  };
}
