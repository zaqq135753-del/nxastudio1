// Configuração central por app — Onda A do redesign NXA.
// Centraliza copy orientada por dor + missões + atalhos + estados vazios + bottom nav.
// Consumido por hub, apps/*/index, landings e componentes commerce.

import type { LucideIcon } from "lucide-react";
import {
  ChefHat, Megaphone, PawPrint, Languages, Flower2, Wallet,
  Dumbbell, Shirt, Moon, Plane,
  Sparkles, Camera, CalendarDays, HeartPulse, ShoppingBag,
  MessageCircle, MessageCircleHeart, ClipboardList, Utensils, GraduationCap,
  Refrigerator, PenLine, Hash, LineChart, Home, User, BookOpen, ListChecks,
  Receipt, Target, Activity, Palette, Stars, Sparkle, Heart, Compass, Mic,
  Route as RouteIcon, MapPin,
} from "lucide-react";

export type AppMission = {
  id: string;
  label: string;   // "Cozinhar agora"
  desc: string;    // "Resolvo com o que você tem em casa"
  icon: LucideIcon;
  to: string;      // rota interna
  prime?: boolean;
};

export type BottomNavItem = { to: string; label: string; icon: LucideIcon };

export type AppConfig = {
  slug: string;
  name: string;               // "NXA Chef"
  shortName: string;          // "Chef"
  category: string;           // "Alimentação"
  icon: LucideIcon;
  accent: string;             // token cor de acento por app
  // Copy orientada por dor
  pain: string;               // dor real do usuário
  heroTitle: string;          // frase do hero na home do app
  heroSubtitle: string;       // apoio do hero
  heroCta: { label: string; to: string };
  helpMePrompt: string;       // texto do botão "Me ajuda agora"
  // Missões (substitui "cards de função")
  missions: AppMission[];
  // Menu inferior contextual (2º item muda por app)
  bottomNav: BottomNavItem[];
  // Estados vazios amigáveis
  emptyStates: {
    stats: string;            // no lugar de "0 X"
    memory: string;           // painel memória
    media: string;            // aba mídia
  };
  // Notificação inteligente exemplo (usada no dashboard "próxima ação")
  smartNotification: string;
  // Automação Prime (Autopilot)
  autopilot: { name: string; desc: string };
  // Card commerce (frase orientada por resultado)
  cardHook: string;
  // Sugestões do AICommandBar
  suggestions: string[];
};

const CFG: Record<string, AppConfig> = {
  saboria: {
    slug: "saboria",
    name: "NXA Chef", shortName: "Chef", category: "Alimentação",
    icon: ChefHat, accent: "amber",
    pain: "Não sei o que comer, não quero desperdiçar comida e não quero perder tempo planejando.",
    heroTitle: "Resolva sua próxima refeição com o que você já tem.",
    heroSubtitle: "Ideias, cardápio e nutri virtual — sem precisar sair de casa.",
    heroCta: { label: "Cozinhar agora", to: "/apps/saboria/agora" },
    helpMePrompt: "Me ajuda com minha próxima refeição",
    missions: [
      { id: "cook-now", label: "O que faço agora?", desc: "3 ideias com o que tem em casa", icon: Sparkles, to: "/apps/saboria/agora" },
      { id: "fridge", label: "Geladeira IA", desc: "Texto ou foto viram receitas", icon: Refrigerator, to: "/apps/saboria/geladeira" },
      { id: "photo", label: "Foto → Receita", desc: "Escaneie um prato e recrie", icon: Camera, to: "/apps/saboria/foto", prime: true },
      { id: "plan", label: "Planner semanal", desc: "7 dias prontos + compras", icon: CalendarDays, to: "/apps/saboria/planner", prime: true },
      { id: "nutri", label: "Nutri virtual", desc: "Dúvidas 24h com IA", icon: HeartPulse, to: "/apps/saboria/nutri" },
      { id: "pantry", label: "Scanner de despensa", desc: "Estoque automático", icon: ShoppingBag, to: "/apps/saboria/scanner", prime: true },
    ],
    bottomNav: [
      { to: "/apps/saboria", label: "Início", icon: Home },
      { to: "/apps/saboria/agora", label: "Cozinhar", icon: ChefHat },
      { to: "/apps/saboria/nutri", label: "IA", icon: MessageCircle },
      { to: "/apps/saboria/receitas", label: "Receitas", icon: BookOpen },
      { to: "/apps/saboria/onboarding", label: "Perfil", icon: User },
    ],
    emptyStates: {
      stats: "Comece uma receita e seus dados aparecem aqui.",
      memory: "A Chef vai lembrar seu paladar conforme você usar.",
      media: "Gere seu primeiro cardápio em PDF quando estiver com Prime.",
    },
    smartNotification: "Seu cardápio da semana está pronto — abra para ver.",
    autopilot: { name: "Cardápio automático de domingo", desc: "Todo domingo à noite, monto sua semana e a lista de compras." },
    cardHook: "Resolva sua próxima refeição com IA.",
    suggestions: [
      "Tenho arroz, frango e ovo — o que faço?",
      "Quero um jantar leve em 15 minutos",
      "Monte meu cardápio da semana",
      "Foto da minha geladeira, sugere algo",
    ],
  },
  socialia: {
    slug: "socialia",
    name: "NXA Social", shortName: "Social", category: "Conteúdo",
    icon: Megaphone, accent: "violet",
    pain: "Não sei o que postar, não mantenho constância e meu conteúdo não tem estratégia.",
    heroTitle: "Tenha conteúdo pronto para postar hoje.",
    heroSubtitle: "Da ideia ao calendário — a IA cuida do resto.",
    heroCta: { label: "Criar post agora", to: "/apps/socialia/gerador" },
    helpMePrompt: "Me ajuda a postar hoje",
    missions: [
      { id: "post", label: "Gerar post", desc: "Legenda + hook + CTA", icon: PenLine, to: "/apps/socialia/gerador" },
      { id: "cal", label: "Calendário editorial", desc: "Mês inteiro planejado", icon: CalendarDays, to: "/apps/socialia/calendario", prime: true },
      { id: "hash", label: "Hashtags inteligentes", desc: "Alcance por nicho", icon: Hash, to: "/apps/socialia/hashtags" },
      { id: "analyze", label: "Analisar @", desc: "Diagnóstico do seu perfil", icon: LineChart, to: "/apps/socialia/analise", prime: true },
    ],
    bottomNav: [
      { to: "/apps/socialia", label: "Início", icon: Home },
      { to: "/apps/socialia/gerador", label: "Criar", icon: PenLine },
      { to: "/apps/socialia/calendario", label: "Agenda", icon: CalendarDays },
      { to: "/apps/socialia/hashtags", label: "Hashtags", icon: Hash },
      { to: "/apps/socialia/analise", label: "Perfil", icon: User },
    ],
    emptyStates: {
      stats: "Publique sua primeira ideia — o histórico começa aqui.",
      memory: "Vou lembrar do seu tom de voz e temas favoritos.",
      media: "Exporte calendário e briefings ao ativar Prime.",
    },
    smartNotification: "Hoje é um bom dia para postar sobre tendência da semana.",
    autopilot: { name: "Calendário automático", desc: "Toda segunda gero seu calendário editorial da semana." },
    cardHook: "Tenha conteúdo pronto para postar todos os dias.",
    suggestions: [
      "Preciso postar algo hoje",
      "Ideia de Reels sobre meu nicho",
      "Analisa meu @",
      "Cria um mês de calendário",
    ],
  },
  petia: {
    slug: "petia",
    name: "NXA Pet", shortName: "Pet", category: "Cuidado animal",
    icon: PawPrint, accent: "emerald",
    pain: "Fico inseguro quando meu pet passa mal, esqueço cuidados e não sei alimentar direito.",
    heroTitle: "Cuide melhor do seu pet com orientação inteligente.",
    heroSubtitle: "Chat vet 24h, saúde, alimentação e triagem de sintomas.",
    heroCta: { label: "Checar meu pet agora", to: "/apps/petia/chat" },
    helpMePrompt: "Me ajuda com meu pet",
    missions: [
      { id: "chat", label: "Chat Vet 24h", desc: "Dúvidas com IA em tempo real", icon: MessageCircleHeart, to: "/apps/petia/chat" },
      { id: "triage", label: "Triagem de sintomas", desc: "Foto/texto → nível de urgência", icon: HeartPulse, to: "/apps/petia/triagem", prime: true },
      { id: "food", label: "Alimentação", desc: "Plano por raça e idade", icon: Utensils, to: "/apps/petia/alimentacao" },
      { id: "train", label: "Treino", desc: "Comportamento passo a passo", icon: GraduationCap, to: "/apps/petia/treino" },
    ],
    bottomNav: [
      { to: "/apps/petia", label: "Início", icon: Home },
      { to: "/apps/petia/chat", label: "Cuidar", icon: MessageCircleHeart },
      { to: "/apps/petia/saude", label: "Saúde", icon: HeartPulse },
      { to: "/apps/petia/alimentacao", label: "Alimentação", icon: Utensils },
      { to: "/apps/petia/perfil", label: "Perfil", icon: User },
    ],
    emptyStates: {
      stats: "Cadastre seu pet e veja tudo em um só lugar.",
      memory: "Vou lembrar restrições, raça e histórico do seu pet.",
      media: "Gere relatório para o veterinário com Prime.",
    },
    smartNotification: "Próxima vacina em 3 dias — quer marcar lembrete?",
    autopilot: { name: "Agenda de saúde", desc: "Aviso automático de vacinas, vermífugos e banhos." },
    cardHook: "Cuide melhor do seu pet com alertas e triagem inteligente.",
    suggestions: [
      "Meu cachorro comeu chocolate",
      "Qual a ração ideal pro meu pet?",
      "Como ensinar sentar em 3 dias",
      "Meu gato vomitou, é grave?",
    ],
  },
  fluencyia: {
    slug: "fluencyia",
    name: "NXA Língua", shortName: "Língua", category: "Idiomas",
    icon: Languages, accent: "sky",
    pain: "Tenho vergonha de falar, não sei onde erro e estudo coisas que não uso.",
    heroTitle: "Pratique situações reais e fale com mais confiança.",
    heroSubtitle: "Conversa, pronúncia e vocabulário sob medida.",
    heroCta: { label: "Praticar agora", to: "/apps/fluencyia/conversar" },
    helpMePrompt: "Me ajuda a praticar hoje",
    missions: [
      { id: "chat", label: "Conversar", desc: "Texto ou voz com correção", icon: MessageCircle, to: "/apps/fluencyia/conversar" },
      { id: "vocab", label: "Vocabulário", desc: "Flashcards adaptativos", icon: BookOpen, to: "/apps/fluencyia/vocabulario" },
    ],
    bottomNav: [
      { to: "/apps/fluencyia", label: "Início", icon: Home },
      { to: "/apps/fluencyia/conversar", label: "Praticar", icon: MessageCircle },
      { to: "/apps/fluencyia/vocabulario", label: "Vocab", icon: BookOpen },
      { to: "/apps/fluencyia/perfil", label: "Perfil", icon: User },
    ],
    emptyStates: {
      stats: "Nenhuma sessão ainda. Comece com uma prática guiada.",
      memory: "Vou lembrar seus erros comuns e vocabulário fraco.",
      media: "Exporte plano de estudo em áudio/PDF com Prime.",
    },
    smartNotification: "Hora da sua prática de 15 minutos.",
    autopilot: { name: "Prática diária", desc: "Envio uma sessão nova todo dia no seu horário." },
    cardHook: "Fale com mais confiança em situações reais.",
    suggestions: [
      "Simule uma entrevista em inglês",
      "Corrija minha pronúncia",
      "Vocabulário de viagem",
      "Prática de 15 min hoje",
    ],
  },
  glowia: {
    slug: "glowia",
    name: "NXA Glow", shortName: "Glow", category: "Skincare",
    icon: Flower2, accent: "rose",
    pain: "Compro produto errado, não sei montar rotina e não acompanho se minha pele melhora.",
    heroTitle: "Monte uma rotina de skincare que combina com sua pele.",
    heroSubtitle: "Análise por foto, rotina AM/PM e dermato virtual.",
    heroCta: { label: "Analisar minha rotina", to: "/apps/glowia/rotina" },
    helpMePrompt: "Me ajuda com minha pele",
    missions: [
      { id: "routine", label: "Rotina de hoje", desc: "AM e PM personalizadas", icon: ListChecks, to: "/apps/glowia/rotina" },
      { id: "analyze", label: "Análise por foto", desc: "IA lê sua pele", icon: Camera, to: "/apps/glowia/analise", prime: true },
      { id: "profile", label: "Perfil de pele", desc: "Tipo, sensibilidade, objetivo", icon: ClipboardList, to: "/apps/glowia/perfil" },
    ],
    bottomNav: [
      { to: "/apps/glowia", label: "Início", icon: Home },
      { to: "/apps/glowia/rotina", label: "Rotina", icon: ListChecks },
      { to: "/apps/glowia/analise", label: "Análise", icon: Camera },
      { to: "/apps/glowia/perfil", label: "Perfil", icon: User },
    ],
    emptyStates: {
      stats: "Registre sua rotina para ver evolução.",
      memory: "Vou lembrar produtos, sensibilidades e objetivos.",
      media: "Rotina em PDF disponível com Prime.",
    },
    smartNotification: "Não esqueça o protetor solar hoje.",
    autopilot: { name: "Revisão mensal", desc: "Revejo sua rotina conforme sua pele muda." },
    cardHook: "Monte uma rotina que acompanha sua pele.",
    suggestions: [
      "Minha pele está oleosa, o que faço?",
      "Analisa uma foto da minha pele",
      "Rotina AM pra pele sensível",
      "Vale trocar meu sérum?",
    ],
  },
  granaia: {
    slug: "granaia",
    name: "NXA Grana", shortName: "Grana", category: "Finanças",
    icon: Wallet, accent: "green",
    pain: "Não sei pra onde meu dinheiro vai, compro por impulso e não sei se posso gastar.",
    heroTitle: "Saiba se pode gastar antes de se arrepender.",
    heroSubtitle: "Extrato, metas e consultor financeiro IA.",
    heroCta: { label: "Analisar uma compra", to: "/apps/granaia/comprar" },
    helpMePrompt: "Me ajuda a decidir essa compra",
    missions: [
      { id: "buy", label: "Posso comprar?", desc: "Impacto no seu mês", icon: Sparkles, to: "/apps/granaia/comprar", prime: true },
      { id: "tx", label: "Transações", desc: "Registro rápido", icon: Receipt, to: "/apps/granaia/transacoes" },
      { id: "scan", label: "Scanner de nota", desc: "Categoriza automático", icon: Camera, to: "/apps/granaia/scanner", prime: true },
      { id: "goals", label: "Metas", desc: "Reserva e sonhos", icon: Target, to: "/apps/granaia/metas" },
      { id: "chat", label: "Chat IA", desc: "Consultor 24h", icon: MessageCircle, to: "/apps/granaia/chat" },
    ],
    bottomNav: [
      { to: "/apps/granaia", label: "Início", icon: Home },
      { to: "/apps/granaia/transacoes", label: "Gastos", icon: Receipt },
      { to: "/apps/granaia/comprar", label: "Comprar?", icon: Sparkles },
      { to: "/apps/granaia/metas", label: "Metas", icon: Target },
      { to: "/apps/granaia/chat", label: "IA", icon: MessageCircle },
    ],
    emptyStates: {
      stats: "Registre um gasto para começar a organizar seu mês.",
      memory: "Vou lembrar limites, categorias e metas suas.",
      media: "Relatório mensal em PDF com Prime.",
    },
    smartNotification: "Você passou 80% do limite de delivery deste mês.",
    autopilot: { name: "Fechamento mensal", desc: "Fecho seu mês e mostro onde ajustar." },
    cardHook: "Descubra se pode gastar antes de se arrepender.",
    suggestions: [
      "Posso comprar um tênis de R$ 300?",
      "Onde gastei mais esse mês?",
      "Cria plano de reserva",
      "Detecta assinaturas ativas",
    ],
  },
  fitia: {
    slug: "fitia",
    name: "NXA Fit", shortName: "Fit", category: "Treino",
    icon: Dumbbell, accent: "orange",
    pain: "Não sei treinar direito, tenho medo de fazer errado e desisto quando não vejo progresso.",
    heroTitle: "Treine hoje com um plano adaptado ao seu corpo e rotina.",
    heroSubtitle: "Personal IA com progressão real.",
    heroCta: { label: "Começar treino", to: "/apps/fitia/treino" },
    helpMePrompt: "Me ajuda a treinar agora",
    missions: [
      { id: "today", label: "Treino de hoje", desc: "Adaptado ao seu dia", icon: Dumbbell, to: "/apps/fitia/hoje" },
      { id: "free", label: "Treino livre", desc: "Monta na hora", icon: Sparkles, to: "/apps/fitia/treino" },
      { id: "coach", label: "Coach IA", desc: "Tira dúvidas técnicas", icon: MessageCircle, to: "/apps/fitia/chat" },
      { id: "prog", label: "Progresso", desc: "Cargas, medidas, fotos", icon: Activity, to: "/apps/fitia/progresso" },
    ],
    bottomNav: [
      { to: "/apps/fitia", label: "Início", icon: Home },
      { to: "/apps/fitia/treino", label: "Treinar", icon: Dumbbell },
      { to: "/apps/fitia/chat", label: "Coach", icon: MessageCircle },
      { to: "/apps/fitia/progresso", label: "Progresso", icon: Activity },
      { to: "/apps/fitia", label: "Perfil", icon: User },
    ],
    emptyStates: {
      stats: "Faça seu primeiro treino para ver evolução.",
      memory: "Vou lembrar cargas, lesões e preferências.",
      media: "Plano semanal em PDF com Prime.",
    },
    smartNotification: "Treino de hoje adaptado para 30 minutos.",
    autopilot: { name: "Ajuste semanal", desc: "Toda semana ajusto seu plano conforme sua evolução." },
    cardHook: "Treine com um plano que se adapta a você.",
    suggestions: [
      "Estou cansado, treino ou descanso?",
      "Treino de 20 min sem equipamento",
      "Substitui agachamento por dor no joelho",
      "Como quebrar meu platô?",
    ],
  },
  styleia: {
    slug: "styleia",
    name: "NXA Style", shortName: "Style", category: "Moda",
    icon: Shirt, accent: "fuchsia",
    pain: "Tenho roupa, mas não sei o que vestir. Compro peças que não combinam.",
    heroTitle: "Monte looks bons com as peças que você já tem.",
    heroSubtitle: "Armário digital, look do dia e personal shopper.",
    heroCta: { label: "Gerar meu look", to: "/apps/styleia/look" },
    helpMePrompt: "Me ajuda a escolher um look",
    missions: [
      { id: "closet", label: "Armário digital", desc: "Cadastre por foto", icon: ShoppingBag, to: "/apps/styleia/armario", prime: true },
      { id: "look", label: "Look do dia", desc: "Com o que você tem", icon: Palette, to: "/apps/styleia/look" },
      { id: "shop", label: "Personal shopper", desc: "5 peças-chave pra investir", icon: Sparkles, to: "/apps/styleia/shopper", prime: true },
    ],
    bottomNav: [
      { to: "/apps/styleia", label: "Início", icon: Home },
      { to: "/apps/styleia/look", label: "Look", icon: Palette },
      { to: "/apps/styleia/armario", label: "Armário", icon: ShoppingBag },
      { to: "/apps/styleia/shopper", label: "Shopper", icon: Sparkles },
      { to: "/apps/styleia/perfil", label: "Perfil", icon: User },
    ],
    emptyStates: {
      stats: "Cadastre sua primeira peça para montar looks reais.",
      memory: "Vou lembrar seu estilo, corpo e cores favoritas.",
      media: "Guia de looks em PDF com Prime.",
    },
    smartNotification: "Hoje vai esfriar, montei um look pra você.",
    autopilot: { name: "Look pela previsão", desc: "Todo dia sugiro um look com base no clima." },
    cardHook: "Monte looks bons com o que você já tem.",
    suggestions: [
      "Tenho um jantar hoje, o que vestir?",
      "Cadastra essa peça pra mim",
      "5 peças pra investir esse mês",
      "Look pra reunião online",
    ],
  },
  studyia: {
    slug: "studyia",
    name: "NXA Study", shortName: "Study", category: "Educação & ENEM",
    icon: GraduationCap, accent: "indigo",
    pain: "Estou acumulado com matérias do ENEM, não sei se minha redação tá boa e travo em questões difíceis.",
    heroTitle: "Destrave sua Nota 900+ no ENEM e conquiste sua vaga na faculdade dos sonhos 🚀",
    heroSubtitle: "Correção por foto da redação manuscrita, esqueletos coringa prontos e Tutor IA 24h para você gabaritar a prova!",
    heroCta: { label: "Corrigir redação agora", to: "/apps/studyia/redacao" },
    helpMePrompt: "Me ajuda a estudar pro ENEM hoje",
    missions: [
      { id: "essay", label: "Corretor de Redação", desc: "Nota 0 a 1000 + 5 competências", icon: PenLine, to: "/apps/studyia/redacao" },
      { id: "skeleton", label: "Esqueletos Coringa", desc: "Estruturas prontas pra qualquer tema", icon: Sparkle, to: "/apps/studyia/esqueletos", prime: true },
      { id: "tutor", label: "Tira-Dúvidas 24h", desc: "Explicação passo a passo de questões", icon: MessageCircle, to: "/apps/studyia/tutor" },
      { id: "plan", label: "Plano Reta Final", desc: "O que revisar dia a dia", icon: Target, to: "/apps/studyia/plano" },
      { id: "quiz", label: "Simulador Express", desc: "5 questões por matéria com gabarito", icon: ListChecks, to: "/apps/studyia/simulado" },
      { id: "cards", label: "Flashcards Rápidos", desc: "Fichas de memorização 3D pro celular", icon: BookOpen, to: "/apps/studyia/flashcards", prime: true },
      { id: "audio", label: "Caderno de Áudio (Feynman)", desc: "Grave sua voz e receba análise da IA", icon: Mic, to: "/apps/studyia/audio", prime: true },
      { id: "tracker", label: "Diagnóstico & NOTA SISU", desc: "Evolução de desempenho e nota estimada", icon: LineChart, to: "/apps/studyia/diagnostico", prime: true },
    ],
    bottomNav: [
      { to: "/apps/studyia", label: "Início", icon: Home },
      { to: "/apps/studyia/redacao", label: "Redação", icon: PenLine },
      { to: "/apps/studyia/esqueletos", label: "Coringa", icon: Sparkle },
      { to: "/apps/studyia/tutor", label: "Tutor IA", icon: MessageCircle },
      { to: "/apps/studyia/perfil", label: "Perfil", icon: User },
    ],
    emptyStates: {
      stats: "Cole sua primeira redação para ver seu diagnóstico de nota.",
      memory: "Vou lembrar seus pontos fracos na redação pra você evoluir.",
      media: "Exporte seu relatório de desempenho em PDF com Prime.",
    },
    smartNotification: "Sua prova tá chegando — que tal mandar 1 redação hoje?",
    autopilot: { name: "Simulado de Domingo", desc: "Todo domingo envio 5 questões das matérias que você mais erra." },
    cardHook: "Garanta 900+ na redação do ENEM com correção instantânea.",
    suggestions: [
      "Corrija minha redação sobre tecnologia",
      "Me dá um modelo coringa pro tema de hoje",
      "Explica essa questão de química pra mim",
      "O que estudar faltando 90 dias?",
    ],
  },
  roteiroia: {
    slug: "roteiroia",
    name: "NXA Roteiro", shortName: "Travel", category: "Viagens",
    icon: Plane, accent: "cyan",
    pain: "Planejar viagem dá trabalho, não sei montar roteiro bom e tenho medo de gastar mal.",
    heroTitle: "Transforme seu destino em um roteiro completo.",
    heroSubtitle: "Dias, atrações, restaurantes e orçamento.",
    heroCta: { label: "Criar roteiro", to: "/apps/roteiroia/criar" },
    helpMePrompt: "Me ajuda a planejar essa viagem",
    missions: [
      { id: "create", label: "Criar roteiro", desc: "Dia a dia completo", icon: Compass, to: "/apps/roteiroia/criar" },
      { id: "mine", label: "Minhas viagens", desc: "Histórico e edição", icon: RouteIcon, to: "/apps/roteiroia/meus" },
      { id: "chat", label: "Consultor IA", desc: "Dúvidas de destino", icon: MessageCircle, to: "/apps/roteiroia/chat" },
    ],
    bottomNav: [
      { to: "/apps/roteiroia", label: "Início", icon: Home },
      { to: "/apps/roteiroia/criar", label: "Roteiro", icon: Compass },
      { to: "/apps/roteiroia/meus", label: "Meus", icon: RouteIcon },
      { to: "/apps/roteiroia/chat", label: "IA", icon: MessageCircle },
      { to: "/apps/roteiroia", label: "Destinos", icon: MapPin },
    ],
    emptyStates: {
      stats: "Crie seu primeiro roteiro pra ver aqui.",
      memory: "Vou lembrar destinos preferidos e estilo de viagem.",
      media: "Guia de viagem em PDF com Prime.",
    },
    smartNotification: "Vai chover no dia 2 — criei um plano B.",
    autopilot: { name: "Revisão pré-viagem", desc: "1 semana antes reviso clima e ajusto o roteiro." },
    cardHook: "Planeje sua viagem sem perder horas pesquisando.",
    suggestions: [
      "Roteiro de 5 dias em Lisboa",
      "Viagem barata pro Nordeste em maio",
      "Plano B se chover em Paris",
      "Restaurantes em Buenos Aires",
    ],
  },
};

export function getAppConfig(slug: string): AppConfig | undefined {
  return CFG[slug];
}

export const APP_CONFIGS: AppConfig[] = Object.values(CFG);
