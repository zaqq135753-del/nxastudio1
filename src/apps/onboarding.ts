// Configuração de onboarding por app.
// Cada app define 2-3 perguntas essenciais que personalizam a experiência.

export type OnboardingStep = {
  key: string;
  question: string;
  hint?: string;
  type: "choice" | "text" | "multi";
  options?: string[];
  placeholder?: string;
};

export type AppOnboardingConfig = {
  title: string;
  subtitle: string;
  steps: OnboardingStep[];
};

export const APP_ONBOARDING: Record<string, AppOnboardingConfig> = {
  saboria: {
    title: "Bem-vindo ao NXA Chef",
    subtitle: "Vamos calibrar seu paladar em 30 segundos.",
    steps: [
      { key: "goal", question: "Qual seu objetivo?", type: "choice",
        options: ["Comer melhor", "Emagrecer", "Ganhar massa", "Economizar", "Praticidade"] },
      { key: "restrictions", question: "Restrições alimentares?", type: "multi",
        options: ["Nenhuma", "Vegetariano", "Vegano", "Sem glúten", "Sem lactose", "Low carb"] },
      { key: "household", question: "Quantas pessoas em casa?", type: "choice",
        options: ["1", "2", "3-4", "5+"] },
    ],
  },
  fitia: {
    title: "Bem-vindo ao NXA Fit",
    subtitle: "Personalize seu treino em 3 passos.",
    steps: [
      { key: "goal", question: "Seu objetivo principal?", type: "choice",
        options: ["Perder gordura", "Ganhar massa", "Condicionamento", "Reabilitação", "Saúde geral"] },
      { key: "level", question: "Seu nível atual?", type: "choice",
        options: ["Iniciante", "Intermediário", "Avançado"] },
      { key: "frequency", question: "Quantos dias por semana?", type: "choice",
        options: ["2-3", "4-5", "6-7"] },
    ],
  },
  granaia: {
    title: "Bem-vindo ao NXA Grana",
    subtitle: "Configuração rápida das suas finanças.",
    steps: [
      { key: "goal", question: "Prioridade agora?", type: "choice",
        options: ["Sair das dívidas", "Guardar para meta", "Investir", "Organizar gastos"] },
      { key: "income", question: "Renda mensal aproximada?", type: "choice",
        options: ["Até R$3k", "R$3k-R$8k", "R$8k-R$20k", "R$20k+"] },
      { key: "currency", question: "Moeda principal?", type: "choice",
        options: ["BRL", "USD", "EUR"] },
    ],
  },
  petia: {
    title: "Bem-vindo ao NXA Pet",
    subtitle: "Conte sobre seu pet.",
    steps: [
      { key: "species", question: "Qual espécie?", type: "choice",
        options: ["Cão", "Gato", "Ave", "Outro"] },
      { key: "age", question: "Faixa etária?", type: "choice",
        options: ["Filhote", "Adulto", "Idoso"] },
      { key: "focus", question: "Foco principal?", type: "choice",
        options: ["Saúde", "Alimentação", "Comportamento", "Treino"] },
    ],
  },
  fluencyia: {
    title: "Bem-vindo ao NXA Fluency",
    subtitle: "Vamos calibrar seu inglês.",
    steps: [
      { key: "level", question: "Seu nível atual?", type: "choice",
        options: ["Iniciante", "Básico", "Intermediário", "Avançado"] },
      { key: "goal", question: "Objetivo principal?", type: "choice",
        options: ["Conversação", "Viagem", "Trabalho", "Certificação"] },
      { key: "minutes", question: "Minutos por dia?", type: "choice",
        options: ["5-10", "15-30", "30+"] },
    ],
  },
  glowia: {
    title: "Bem-vindo ao NXA Glow",
    subtitle: "Personalize sua rotina de skincare.",
    steps: [
      { key: "skinType", question: "Tipo de pele?", type: "choice",
        options: ["Seca", "Oleosa", "Mista", "Sensível", "Normal"] },
      { key: "concerns", question: "Principais preocupações?", type: "multi",
        options: ["Acne", "Manchas", "Rugas", "Poros", "Ressecamento"] },
      { key: "budget", question: "Orçamento mensal?", type: "choice",
        options: ["Até R$100", "R$100-R$300", "R$300+"] },
    ],
  },
  styleia: {
    title: "Bem-vindo ao NXA Style",
    subtitle: "Vamos entender seu estilo.",
    steps: [
      { key: "style", question: "Estilo que mais combina?", type: "choice",
        options: ["Minimalista", "Casual", "Clássico", "Streetwear", "Elegante"] },
      { key: "occasion", question: "Uso principal?", type: "choice",
        options: ["Trabalho", "Dia a dia", "Eventos", "Todos"] },
      { key: "budget", question: "Orçamento por peça?", type: "choice",
        options: ["Até R$150", "R$150-R$500", "R$500+"] },
    ],
  },
  socialia: {
    title: "Bem-vindo ao NXA Social",
    subtitle: "Configure sua estratégia de conteúdo.",
    steps: [
      { key: "niche", question: "Seu nicho?", type: "text", placeholder: "Ex: fitness, moda, gastronomia..." },
      { key: "platforms", question: "Plataformas principais?", type: "multi",
        options: ["Instagram", "TikTok", "YouTube", "LinkedIn", "X/Twitter"] },
      { key: "tone", question: "Tom de voz?", type: "choice",
        options: ["Descontraído", "Profissional", "Inspirador", "Educativo"] },
    ],
  },

  roteiroia: {
    title: "Bem-vindo ao NXA Roteiro",
    subtitle: "Como você gosta de viajar?",
    steps: [
      { key: "style", question: "Estilo de viagem?", type: "choice",
        options: ["Aventura", "Cultural", "Praia", "Gastronômica", "Mochilão"] },
      { key: "pace", question: "Ritmo?", type: "choice",
        options: ["Relaxado", "Equilibrado", "Intenso"] },
      { key: "budget", question: "Orçamento por dia?", type: "choice",
        options: ["Econômico", "Confortável", "Luxo"] },
    ],
  },
};
