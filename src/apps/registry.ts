import { Refrigerator, Camera, CalendarDays, HeartPulse, Home, type LucideIcon,
         ChefHat, Dumbbell, Wallet, Sparkles, PenLine, Hash, LineChart, Megaphone,
         PawPrint, MessageCircleHeart, Utensils, GraduationCap, User,
         Languages, BookOpen, MessageCircle, Flower2, ClipboardList, ListChecks,
         Receipt, Target, Activity, Shirt, Palette, ShoppingBag,
         Moon, Stars, Heart, Sparkle,
         Plane, MapPin, Compass, Route as RouteIcon } from "lucide-react";

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
    name: "NXA Chef",
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
    name: "NXA Social",
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
    name: "NXA Pet",
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
    name: "NXA Lingua",
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
    name: "NXA Glow",
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
    name: "NXA Money",
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
    name: "NXA Fit",
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
  {
    slug: "styleia",
    name: "NXA Style",
    tagline: "Consultora de estilo com IA",
    description: "Guarda-roupa digital, looks do dia e personal shopper com IA.",
    icon: Shirt,
    status: "live",
    route: "/apps/styleia",
    tabs: [
      { to: "/apps/styleia",           label: "Início",   icon: Home },
      { to: "/apps/styleia/armario",   label: "Armário",  icon: ShoppingBag },
      { to: "/apps/styleia/look",      label: "Look",     icon: Palette },
      { to: "/apps/styleia/shopper",   label: "Shopper",  icon: Sparkles },
      { to: "/apps/styleia/perfil",    label: "Perfil",   icon: User },
    ],
  },
  {
    slug: "cosmosia",
    name: "NXA Estudantil",
    tagline: "Sua aprovação no ENEM com IA",
    description: "Correção de redação instantânea, modelos coringa 900+, simulados e tira-dúvidas 24h.",
    icon: GraduationCap,
    status: "live",
    route: "/apps/cosmosia",
    tabs: [
      { to: "/apps/cosmosia",              label: "Início",    icon: Home },
      { to: "/apps/cosmosia/redacao",      label: "Redação",   icon: PenLine },
      { to: "/apps/cosmosia/esqueletos",   label: "Coringa",   icon: Sparkle },
      { to: "/apps/cosmosia/tutor",        label: "Tutor IA",  icon: MessageCircle },
      { to: "/apps/cosmosia/perfil",       label: "Perfil",    icon: User },
    ],
  },
  {
    slug: "roteiroia",
    name: "NXA Travel",
    tagline: "Agente de viagens com IA",
    description: "Roteiros dia-a-dia personalizados, orçamento e chat de destinos.",
    icon: Plane,
    status: "live",
    route: "/apps/roteiroia",
    tabs: [
      { to: "/apps/roteiroia",            label: "Início",   icon: Home },
      { to: "/apps/roteiroia/criar",      label: "Criar",    icon: Compass },
      { to: "/apps/roteiroia/meus",       label: "Meus",     icon: RouteIcon },
      { to: "/apps/roteiroia/destinos",   label: "Destinos", icon: MapPin },
      { to: "/apps/roteiroia/chat",       label: "Chat IA",  icon: MessageCircle },
    ],
  },
] as const;

export function findApp(slug: string): AppEntry | undefined {
  return APPS.find((a) => a.slug === slug);
}

export const SUITE = {
  name: "NXA Studio",
  tagline: "Uma conta. Vários apps de IA.",
  pricePerApp: "R$ 29 / mês",
  icon: Sparkles,
};
