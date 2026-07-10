import { Refrigerator, Camera, CalendarDays, HeartPulse, Home, type LucideIcon,
         ChefHat, Dumbbell, Wallet, Sparkles, PenLine, Hash, LineChart, Megaphone,
         PawPrint, MessageCircleHeart, Utensils, GraduationCap, User,
         Languages, BookOpen, MessageCircle, Flower2, ClipboardList, ListChecks,
         Receipt, Target, Activity } from "lucide-react";

export type AppTab = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export type AppEntry = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  status: "live" | "soon";
  route: string;
  tabs: AppTab[];
};

export const APPS: readonly AppEntry[] = [
  {
    slug: "saboria",
    name: "SaborIA",
    tagline: "Chef pessoal com IA",
    description: "Receitas do que você tem em casa, planner semanal, foto → receita e nutri virtual 24h.",
    icon: ChefHat,
    status: "live",
    route: "/apps/saboria",
    tabs: [
      { to: "/apps/saboria",             label: "Início",    icon: Home },
      { to: "/apps/saboria/geladeira",   label: "Geladeira", icon: Refrigerator },
      { to: "/apps/saboria/foto",        label: "Foto",      icon: Camera },
      { to: "/apps/saboria/planner",     label: "Planner",   icon: CalendarDays },
      { to: "/apps/saboria/nutri",       label: "Nutri",     icon: HeartPulse },
    ],
  },
  {
    slug: "socialia",
    name: "SocialIA",
    tagline: "Social media com IA",
    description: "Gera legendas, ideias de post, calendário editorial, hashtags e analisa perfis.",
    icon: Megaphone,
    status: "live",
    route: "/apps/socialia",
    tabs: [
      { to: "/apps/socialia",             label: "Início",     icon: Home },
      { to: "/apps/socialia/gerador",     label: "Gerador",    icon: PenLine },
      { to: "/apps/socialia/calendario",  label: "Calendário", icon: CalendarDays },
      { to: "/apps/socialia/hashtags",    label: "Hashtags",   icon: Hash },
      { to: "/apps/socialia/analise",     label: "Análise",    icon: LineChart },
    ],
  },
  {
    slug: "petia",
    name: "PetIA",
    tagline: "Veterinário virtual com IA",
    description: "Chat veterinário 24h, saúde, alimentação e treino guiados por IA.",
    icon: PawPrint,
    status: "live",
    route: "/apps/petia",
    tabs: [
      { to: "/apps/petia",             label: "Início",      icon: Home },
      { to: "/apps/petia/chat",        label: "Chat Vet",    icon: MessageCircleHeart },
      { to: "/apps/petia/saude",       label: "Saúde",       icon: HeartPulse },
      { to: "/apps/petia/alimentacao", label: "Alimentação", icon: Utensils },
      { to: "/apps/petia/treino",      label: "Treino",      icon: GraduationCap },
      { to: "/apps/petia/perfil",      label: "Perfil",      icon: User },
    ],
  },
  {
    slug: "fluencyia",
    name: "FluencyIA",
    tagline: "Tutor de idiomas com IA",
    description: "Converse, aprenda vocabulário e evolua em inglês, espanhol e mais — com IA que corrige em tempo real.",
    icon: Languages,
    status: "live",
    route: "/apps/fluencyia",
    tabs: [
      { to: "/apps/fluencyia",             label: "Início",     icon: Home },
      { to: "/apps/fluencyia/conversar",   label: "Conversar",  icon: MessageCircle },
      { to: "/apps/fluencyia/vocabulario", label: "Vocab",      icon: BookOpen },
      { to: "/apps/fluencyia/perfil",      label: "Perfil",     icon: User },
    ],
  },
  {
    slug: "glowia",
    name: "GlowIA",
    tagline: "Skincare com IA",
    description: "Análise de pele por foto, rotina AM/PM personalizada e dermatologista virtual.",
    icon: Flower2,
    status: "live",
    route: "/apps/glowia",
    tabs: [
      { to: "/apps/glowia",         label: "Início",  icon: Home },
      { to: "/apps/glowia/analise", label: "Análise", icon: Camera },
      { to: "/apps/glowia/rotina",  label: "Rotina",  icon: ListChecks },
      { to: "/apps/glowia/perfil",  label: "Perfil",  icon: ClipboardList },
    ],
  },
  {
    slug: "granaia",
    name: "GranaIA",
    tagline: "Finanças com IA",
    description: "Controle gastos, orçamento inteligente e consultor financeiro IA.",
    icon: Wallet,
    status: "live",
    route: "/apps/granaia",
    tabs: [
      { to: "/apps/granaia",             label: "Início",      icon: Home },
      { to: "/apps/granaia/transacoes",  label: "Transações",  icon: Receipt },
      { to: "/apps/granaia/chat",        label: "Chat IA",     icon: MessageCircle },
      { to: "/apps/granaia/metas",       label: "Metas",       icon: Target },
    ],
  },
  {
    slug: "fitia",
    name: "FitIA",
    tagline: "Personal trainer com IA",
    description: "Treinos personalizados, chat com coach IA e histórico de progresso.",
    icon: Dumbbell,
    status: "live",
    route: "/apps/fitia",
    tabs: [
      { to: "/apps/fitia",           label: "Início",    icon: Home },
      { to: "/apps/fitia/treino",    label: "Treino",    icon: Dumbbell },
      { to: "/apps/fitia/chat",      label: "Chat IA",   icon: MessageCircle },
      { to: "/apps/fitia/progresso", label: "Progresso", icon: Activity },
    ],
  },
] as const;

export function findApp(slug: string): AppEntry | undefined {
  return APPS.find((a) => a.slug === slug);
}

export const SUITE = {
  name: "Studio IA",
  tagline: "Uma conta. Vários apps de IA.",
  pricePerApp: "R$ 29 / mês",
  icon: Sparkles,
};
