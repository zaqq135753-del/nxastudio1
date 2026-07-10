// Configuração de "voz de marca" e templates de mídia por módulo NXA.
// As vozes usam o TTS do gateway (openai/gpt-4o-mini-tts) — vozes disponíveis:
// alloy, echo, fable, onyx, nova, shimmer, sage, coral, ash.

export type BrandVoice = {
  voice: string;
  ttsStyle: string; // texto para prefixar o prompt do TTS (dá tom)
  ebookTitle: string; // título default do ebook
  pptxTitle: string;
  videoLibrary: { title: string; hint: string; emoji: string }[];
  color: string; // hex primary
};

export const BRAND: Record<string, BrandVoice> = {
  saboria: {
    voice: "coral",
    ttsStyle: "Fale como um chef caloroso, com sotaque italiano leve, gentil e apaixonado por comida.",
    ebookTitle: "Cardápio da Semana",
    pptxTitle: "Menu Editorial NXA Chef",
    color: "#E85D3D",
    videoLibrary: [
      { title: "Massa em 15 min", hint: "receita rápida", emoji: "🍝" },
      { title: "Café da manhã proteico", hint: "3 opções", emoji: "🍳" },
      { title: "Sobras viram jantar", hint: "reaproveitamento", emoji: "🥘" },
      { title: "Marmita fitness", hint: "meal prep", emoji: "🥗" },
      { title: "Sobremesa 5 ingredientes", hint: "doce fácil", emoji: "🍰" },
      { title: "Pão caseiro", hint: "sem sova", emoji: "🍞" },
    ],
  },
  socialia: {
    voice: "nova",
    ttsStyle: "Fale como criador de conteúdo jovem, dinâmico, animado e direto ao ponto.",
    ebookTitle: "Playbook de 30 Posts",
    pptxTitle: "Carrossel Instagram",
    color: "#7C3AED",
    videoLibrary: [
      { title: "Roteiro Reel viral", hint: "gancho + CTA", emoji: "🎬" },
      { title: "Trend do momento", hint: "análise", emoji: "🔥" },
      { title: "Bastidor do processo", hint: "storytelling", emoji: "🎥" },
      { title: "Antes e depois", hint: "transformação", emoji: "✨" },
      { title: "3 mitos do nicho", hint: "educativo", emoji: "💡" },
      { title: "Depoimento cliente", hint: "prova social", emoji: "🗣️" },
    ],
  },
  petia: {
    voice: "sage",
    ttsStyle: "Fale como veterinário amigável e descontraído, transmitindo calma e cuidado.",
    ebookTitle: "Guia do Primeiro Mês",
    pptxTitle: "Plano de Cuidados do Pet",
    color: "#10B981",
    videoLibrary: [
      { title: "Adestramento básico", hint: "senta, deita, fica", emoji: "🐕" },
      { title: "Sinais de dor no pet", hint: "quando levar ao vet", emoji: "🩺" },
      { title: "Enriquecimento ambiental", hint: "brinquedos DIY", emoji: "🎾" },
      { title: "Escovação dental", hint: "passo a passo", emoji: "🦷" },
      { title: "Passeio ideal", hint: "duração e ritmo", emoji: "🐾" },
      { title: "Alimentação natural", hint: "porções corretas", emoji: "🥩" },
    ],
  },
  fluencyia: {
    voice: "echo",
    ttsStyle: "Fale como professor nativo experiente, articulando com clareza para aprendizes.",
    ebookTitle: "Ebook Bilíngue",
    pptxTitle: "Aula do Dia",
    color: "#0EA5E9",
    videoLibrary: [
      { title: "Pronúncia difícil", hint: "shadowing", emoji: "🗣️" },
      { title: "Diálogo no restaurante", hint: "prática guiada", emoji: "🍽️" },
      { title: "10 phrasal verbs", hint: "com exemplos", emoji: "📚" },
      { title: "Gramática essencial", hint: "explicação rápida", emoji: "✏️" },
      { title: "Sotaque nativo", hint: "dicas", emoji: "🎤" },
      { title: "Small talk", hint: "conversas do dia", emoji: "💬" },
    ],
  },
  glowia: {
    voice: "shimmer",
    ttsStyle: "Fale como esteticista, suave, acolhedora, com voz feminina calma.",
    ebookTitle: "Skin Journal",
    pptxTitle: "Sua Rotina Skincare",
    color: "#F472B6",
    videoLibrary: [
      { title: "Ordem correta dos ativos", hint: "AM/PM", emoji: "🧴" },
      { title: "Como aplicar protetor", hint: "quantidade certa", emoji: "☀️" },
      { title: "Máscara semanal", hint: "receita", emoji: "🪞" },
      { title: "Automassagem facial", hint: "3 min", emoji: "💆" },
      { title: "Mitos do skincare", hint: "verdade e mentira", emoji: "❓" },
      { title: "Skincare para dormir", hint: "night routine", emoji: "🌙" },
    ],
  },
  granaia: {
    voice: "onyx",
    ttsStyle: "Fale como executivo financeiro, tom neutro, seguro e claro.",
    ebookTitle: "Relatório Financeiro Mensal",
    pptxTitle: "Diagnóstico Financeiro",
    color: "#1F2937",
    videoLibrary: [
      { title: "Método 50/30/20", hint: "budgeting", emoji: "💰" },
      { title: "Reserva de emergência", hint: "quanto guardar", emoji: "🏦" },
      { title: "Investir do zero", hint: "1º passo", emoji: "📈" },
      { title: "Sair das dívidas", hint: "método bola de neve", emoji: "❄️" },
      { title: "Renda extra", hint: "5 ideias", emoji: "💼" },
      { title: "Poupança automática", hint: "hack", emoji: "🎯" },
    ],
  },
  fitia: {
    voice: "ash",
    ttsStyle: "Fale como personal trainer motivacional, energia alta, ritmo vibrante.",
    ebookTitle: "Plano 12 Semanas",
    pptxTitle: "Ficha de Treino Imprimível",
    color: "#DC2626",
    videoLibrary: [
      { title: "Aquecimento 5 min", hint: "guiado", emoji: "🔥" },
      { title: "Treino em casa full body", hint: "sem equipamento", emoji: "💪" },
      { title: "Alongamento pós-treino", hint: "flexibilidade", emoji: "🧘" },
      { title: "Cardio HIIT", hint: "15 min", emoji: "⚡" },
      { title: "Postura no agachamento", hint: "técnica correta", emoji: "🏋️" },
      { title: "Mobilidade de ombro", hint: "diária", emoji: "🤸" },
    ],
  },
  styleia: {
    voice: "fable",
    ttsStyle: "Fale como consultora de imagem sofisticada, com elegância e assertividade.",
    ebookTitle: "Lookbook Pessoal",
    pptxTitle: "Guia de Estilo",
    color: "#8B5CF6",
    videoLibrary: [
      { title: "Cápsula 10 peças", hint: "guarda-roupa mínimo", emoji: "👗" },
      { title: "Colorimetria explicada", hint: "quente/frio", emoji: "🎨" },
      { title: "Look escritório", hint: "smart casual", emoji: "💼" },
      { title: "Look date night", hint: "elegante", emoji: "🌹" },
      { title: "Cortes que valorizam", hint: "por biotipo", emoji: "✂️" },
      { title: "Acessórios chave", hint: "elevar look", emoji: "💎" },
    ],
  },
  cosmosia: {
    voice: "onyx",
    ttsStyle: "Fale como astrólogo místico, voz grave, pausada e enigmática.",
    ebookTitle: "Mapa Astral Completo",
    pptxTitle: "Compatibilidade Amorosa",
    color: "#4C1D95",
    videoLibrary: [
      { title: "Trânsito da semana", hint: "previsão", emoji: "🌌" },
      { title: "Lua cheia hoje", hint: "ritual", emoji: "🌕" },
      { title: "Retrógrado explicado", hint: "o que fazer", emoji: "♆" },
      { title: "Signos ascendentes", hint: "guia rápido", emoji: "☀️" },
      { title: "Compatibilidade signos", hint: "amor e amizade", emoji: "❤️" },
      { title: "Tarot do dia", hint: "1 carta", emoji: "🔮" },
    ],
  },
  roteiroia: {
    voice: "alloy",
    ttsStyle: "Fale como guia turístico simpático, curioso, transmitindo aventura.",
    ebookTitle: "Roteiro Dia-a-Dia",
    pptxTitle: "Proposta de Viagem",
    color: "#0891B2",
    videoLibrary: [
      { title: "Bagagem inteligente", hint: "checklist", emoji: "🧳" },
      { title: "Aeroporto sem estresse", hint: "hacks", emoji: "✈️" },
      { title: "Roteiro fim de semana", hint: "cidade próxima", emoji: "🗺️" },
      { title: "Comer bem barato", hint: "no destino", emoji: "🍜" },
      { title: "Fotos de viagem", hint: "composição", emoji: "📸" },
      { title: "Segurança no exterior", hint: "básico", emoji: "🛡️" },
    ],
  },
};

export function brandFor(slug: string): BrandVoice {
  return BRAND[slug] ?? BRAND.saboria;
}
