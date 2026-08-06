// Preço + features Base/Prime por app.
// Cada app tem no máximo 2 opções: plano Base e upsell Prime.

export type Plan = {
  name: string;            // ex.: "NXA Chef"
  priceLabel: string;      // ex.: "R$ 29 / mês"
  monthly: number;         // valor numérico BRL (informativo)
  tagline: string;         // frase curta
  features: string[];      // lista Base OU Prime
};

export type AppPricing = {
  base: Plan;
  prime: Plan;
  primeCopy: string;       // headline do upsell modal
  compare: { feature: string; base: boolean | string; prime: boolean | string }[];
};

const P = (base: AppPricing) => base;

export const PRICING: Record<string, AppPricing> = {
  saboria: P({
    base: {
      name: "NXA Chef",
      priceLabel: "R$ 29 / mês",
      monthly: 29,
      tagline: "Seu chef pessoal com IA para o dia a dia.",
      features: [
        "Onboarding de paladar",
        "3 ideias de refeição em segundos",
        "Chat Nutri básico",
        "Receitas salvas (até 20)",
        "Sugestões por fome, humor e tempo",
      ],
    },
    prime: {
      name: "NXA Chef Prime",
      priceLabel: "+ R$ 20 / mês",
      monthly: 20,
      tagline: "Sua semana alimentar pronta, com lista de compras e macros.",
      features: [
        "Planner semanal 7 dias (café, almoço, jantar)",
        "Lista de compras automática",
        "Geladeira IA por texto e foto",
        "Foto → Receita e scanner de despensa",
        "Cálculo nutricional (macros e calorias)",
        "Receitas salvas ilimitadas + galeria com fotos IA",
        "Exportar cardápio em PDF · lembretes",
      ],
    },
    primeCopy: "Adicione Chef Prime e desbloqueie planner semanal, lista de compras automática, foto → receita e scanner de despensa.",
    compare: [
      { feature: "Ideias rápidas de refeição", base: true, prime: true },
      { feature: "Planner semanal 7 dias", base: false, prime: true },
      { feature: "Lista de compras automática", base: false, prime: true },
      { feature: "Foto → Receita", base: false, prime: true },
      { feature: "Scanner de despensa", base: false, prime: true },
      { feature: "Macros e calorias", base: false, prime: true },
      { feature: "Receitas salvas", base: "até 20", prime: "ilimitadas" },
      { feature: "Exportar em PDF", base: false, prime: true },
    ],
  }),

  socialia: P({
    base: {
      name: "NXA Social",
      priceLabel: "R$ 29 / mês",
      monthly: 29,
      tagline: "Ideias, legendas e copies no seu tom.",
      features: [
        "Gerador de posts e legendas",
        "Ideias de vídeo",
        "Hashtags básicas",
        "Calendário simples",
      ],
    },
    prime: {
      name: "NXA Social Prime",
      priceLabel: "+ R$ 30 / mês",
      monthly: 30,
      tagline: "De uma ideia a um mês de conteúdo planejado.",
      features: [
        "Calendário editorial mensal",
        "Melhores horários para postar",
        "Hashtags inteligentes por alcance/nicho",
        "Análise de perfil por @",
        "Banco de ideias virais + packs de conteúdo",
        "Tom de voz salvo da marca",
        "Exportar calendário em PDF/PPTX",
      ],
    },
    primeCopy: "Adicione Social Prime e transforme uma ideia em um mês de conteúdo com estratégia, calendário e posts prontos.",
    compare: [
      { feature: "Legendas e ideias", base: true, prime: true },
      { feature: "Calendário editorial mensal", base: false, prime: true },
      { feature: "Hashtags inteligentes", base: "básicas", prime: "por nicho + alcance" },
      { feature: "Análise de perfil por @", base: false, prime: true },
      { feature: "Packs de conteúdo/campanhas", base: false, prime: true },
      { feature: "Exportar PDF/PPTX", base: false, prime: true },
    ],
  }),

  petia: P({
    base: {
      name: "NXA Pet",
      priceLabel: "R$ 24 / mês",
      monthly: 24,
      tagline: "Vet e adestrador virtual para dúvidas do dia a dia.",
      features: [
        "Perfil completo do pet",
        "Chat de dúvidas",
        "Alimentação e treino básicos",
        "Registro simples de saúde",
      ],
    },
    prime: {
      name: "NXA Pet Prime",
      priceLabel: "+ R$ 20 / mês",
      monthly: 20,
      tagline: "Saúde, vacinas e triagem inteligente do seu pet.",
      features: [
        "Triagem de sintomas por texto e foto",
        "Classificação de urgência",
        "Histórico completo · vacinas · vermífugos",
        "Alertas e lembretes de remédio",
        "Plano alimentar personalizado",
        "Plano progressivo de comandos",
        "Relatório do pet em PDF",
      ],
    },
    primeCopy: "Adicione Pet Prime e acompanhe saúde, vacinas e comportamento com triagem por foto e alertas inteligentes.",
    compare: [
      { feature: "Chat vet", base: true, prime: true },
      { feature: "Triagem de sintomas", base: false, prime: true },
      { feature: "Vacinas e alertas", base: false, prime: true },
      { feature: "Plano alimentar personalizado", base: false, prime: true },
      { feature: "Relatório em PDF", base: false, prime: true },
    ],
  }),

  fluencyia: P({
    base: {
      name: "NXA Lingua",
      priceLabel: "R$ 29 / mês",
      monthly: 29,
      tagline: "Prática de idiomas por chat, no seu ritmo.",
      features: [
        "Conversa por texto",
        "Vocabulário e flashcards simples",
        "Perfil de nível e objetivo",
      ],
    },
    prime: {
      name: "NXA Lingua Prime",
      priceLabel: "+ R$ 25 / mês",
      monthly: 25,
      tagline: "Conversação por voz, correção em tempo real e evolução guiada.",
      features: [
        "Conversação por voz com correção",
        "Simulações reais (aeroporto, entrevista, restaurante)",
        "Flashcards adaptativos · spaced repetition",
        "Teste CEFR e relatório de evolução",
        "Pronúncia com nota e histórico de erros",
        "Plano diário personalizado",
      ],
    },
    primeCopy: "Adicione Língua Prime e pratique conversas reais por voz com correção em tempo real e plano diário.",
    compare: [
      { feature: "Chat de prática", base: true, prime: true },
      { feature: "Conversação por voz", base: false, prime: true },
      { feature: "Correção em tempo real", base: false, prime: true },
      { feature: "Teste CEFR e relatórios", base: false, prime: true },
    ],
  }),

  glowia: P({
    base: {
      name: "NXA Glow",
      priceLabel: "R$ 24 / mês",
      monthly: 24,
      tagline: "Consultora de skincare no chat.",
      features: [
        "Perfil de pele e sensibilidades",
        "Rotina básica",
        "Chat de skincare",
        "Lembretes simples",
      ],
    },
    prime: {
      name: "NXA Glow Prime",
      priceLabel: "+ R$ 20 / mês",
      monthly: 20,
      tagline: "Rotina personalizada e acompanhamento por foto.",
      features: [
        "Análise de pele por foto",
        "Rotina AM/PM personalizada",
        "Histórico com fotos e comparação",
        "Leitura de ingredientes",
        "Recomendações por clima e objetivo",
        "Relatório de pele em PDF",
      ],
    },
    primeCopy: "Adicione Glow Prime e tenha rotina personalizada, análise por foto e acompanhamento da evolução da sua pele.",
    compare: [
      { feature: "Chat de skincare", base: true, prime: true },
      { feature: "Análise por foto", base: false, prime: true },
      { feature: "Histórico com comparação", base: false, prime: true },
      { feature: "Leitura de ingredientes", base: false, prime: true },
    ],
  }),

  granaia: P({
    base: {
      name: "NXA Money",
      priceLabel: "R$ 29 / mês",
      monthly: 29,
      tagline: "Controle financeiro manual guiado por IA.",
      features: [
        "Transações manuais e extrato",
        "Categorização básica",
        "Metas financeiras",
        "Chat financeiro",
      ],
    },
    prime: {
      name: "NXA Money Prime",
      priceLabel: "+ R$ 25 / mês",
      monthly: 25,
      tagline: "Automatize o financeiro do mês e saiba se pode comprar.",
      features: [
        "Scanner de nota fiscal (OCR)",
        "Categorização automática",
        "Relatório mensal + alertas de gasto",
        "Função 'Comprar?' com análise do mês",
        "Simulação de metas e previsão de fechamento",
        "Exportar relatório em PDF",
      ],
    },
    primeCopy: "Adicione Money Prime e organize seus gastos automaticamente com OCR de cupom, alertas e função 'Comprar?'.",
    compare: [
      { feature: "Transações manuais", base: true, prime: true },
      { feature: "OCR de nota fiscal", base: false, prime: true },
      { feature: "Alertas de gasto", base: false, prime: true },
      { feature: "Função 'Comprar?'", base: false, prime: true },
      { feature: "Relatório mensal PDF", base: false, prime: true },
    ],
  }),

  fitia: P({
    base: {
      name: "NXA Fit",
      priceLabel: "R$ 29 / mês",
      monthly: 29,
      tagline: "Personal trainer com IA para o treino do dia.",
      features: [
        "Plano de treino inicial",
        "Treino do dia",
        "Chat de dúvidas",
        "Progresso simples",
      ],
    },
    prime: {
      name: "NXA Fit Prime",
      priceLabel: "+ R$ 25 / mês",
      monthly: 25,
      tagline: "Treino que evolui com você, adaptação e relatórios.",
      features: [
        "Adaptação automática do treino",
        "Macros do dia · evolução de carga",
        "Fotos de comparação · medidas corporais",
        "Substituição inteligente por dor/tempo/equip.",
        "Relatório semanal de performance",
        "Plano combinado treino + alimentação",
      ],
    },
    primeCopy: "Adicione Fit Prime e seu treino se adapta ao corpo, rotina, evolução e objetivo — com relatórios semanais.",
    compare: [
      { feature: "Treino do dia", base: true, prime: true },
      { feature: "Adaptação automática", base: false, prime: true },
      { feature: "Macros e evolução de carga", base: false, prime: true },
      { feature: "Relatório semanal", base: false, prime: true },
    ],
  }),

  styleia: P({
    base: {
      name: "NXA Style",
      priceLabel: "R$ 24 / mês",
      monthly: 24,
      tagline: "Personal stylist no chat.",
      features: [
        "Perfil de estilo",
        "Sugestões simples de look",
        "Chat de moda",
        "Looks por ocasião",
      ],
    },
    prime: {
      name: "NXA Style Prime",
      priceLabel: "+ R$ 20 / mês",
      monthly: 20,
      tagline: "Seu armário vira personal stylist: looks reais com o que você tem.",
      features: [
        "Armário digital (cadastro por foto)",
        "Look do dia com o que você já tem",
        "Personal shopper com 5 peças-chave",
        "Cartela de cores · guia em PDF",
        "Mala automática para viagens",
        "Histórico de looks",
      ],
    },
    primeCopy: "Adicione Style Prime e monte looks reais com as peças do seu armário — inclusive a mala da próxima viagem.",
    compare: [
      { feature: "Chat de moda", base: true, prime: true },
      { feature: "Armário digital", base: false, prime: true },
      { feature: "Look com o que você tem", base: false, prime: true },
      { feature: "Personal shopper", base: false, prime: true },
      { feature: "Mala automática", base: false, prime: true },
    ],
  }),

  studyia: P({
    base: {
      name: "NXA Study",
      priceLabel: "R$ 29,90 / mês",
      monthly: 29.9,
      tagline: "Sua aprovação no ENEM com auxílio de Inteligência Artificial.",
      features: [
        "Corretor de Redação Nota 1000",
        "Esqueletos Coringa Prontos",
        "Caderno de Áudio & Método Feynman",
        "Simulador com Cronômetro do ENEM",
        "Tutor IA Tira-Dúvidas 24h",
      ],
    },
    prime: {
      name: "NXA Study Oferta Especial",
      priceLabel: "R$ 14,90 / mês",
      monthly: 14.9,
      tagline: "Oferta exclusiva de anúncios com acesso total ilimitado.",
      features: [
        "Acesso TOTAL a todas as 7 ferramentas de IA",
        "Corretor de Redação Ilimitado",
        "Caderno de Áudio & Análise Feynman",
        "Simuladores Cronometrados Infinitos",
        "Diagnóstico de Nota TRI do SISU",
      ],
    },
    primeCopy: "Garanta seu acesso ao NXA Study com desconto exclusivo por apenas R$ 14,90!",
    compare: [
      { feature: "Corretor de Redação IA", base: true, prime: true },
      { feature: "Esqueletos Coringa", base: true, prime: true },
      { feature: "Caderno de Áudio (Feynman)", base: true, prime: true },
      { feature: "Simulado com Tempo", base: true, prime: true },
    ],
  }),

  roteiroia: P({
    base: {
      name: "NXA Travel",
      priceLabel: "R$ 24 / mês",
      monthly: 24,
      tagline: "Roteiros simples pra próxima viagem.",
      features: [
        "Roteiro simples por destino/dias",
        "Chat de dúvidas de viagem",
        "Meus roteiros salvos",
      ],
    },
    prime: {
      name: "NXA Travel Prime",
      priceLabel: "+ R$ 25 / mês",
      monthly: 25,
      tagline: "Sua viagem vira um guia completo, dia a dia, com PDF pronto.",
      features: [
        "Roteiro dia a dia com atrações e restaurantes",
        "Deslocamentos e orçamento estimado",
        "Replanejamento se chover",
        "Checklist de mala",
        "Guia em PDF + áudio do roteiro",
        "Roteiro editável e compartilhável",
      ],
    },
    primeCopy: "Adicione Travel Prime e ganhe roteiro dia a dia com orçamento, checklist de mala e guia em PDF.",
    compare: [
      { feature: "Roteiro simples", base: true, prime: true },
      { feature: "Dia a dia detalhado", base: false, prime: true },
      { feature: "Orçamento estimado", base: false, prime: true },
      { feature: "Guia em PDF + áudio", base: false, prime: true },
    ],
  }),
};

export function getPricing(slug: string): AppPricing | undefined {
  return PRICING[slug];
}
