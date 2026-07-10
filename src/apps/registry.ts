import { Refrigerator, Camera, CalendarDays, HeartPulse, Home, type LucideIcon,
         ChefHat, Dumbbell, Wallet, Sparkles, PenLine, Hash, LineChart, Megaphone } from "lucide-react";

export type AppTab = {
  to: string;                // full path
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
  route: string;             // entry route when live
  tabs: AppTab[];            // bottom-nav tabs when inside the app
};

export const APPS: readonly AppEntry[] = [
  {
    slug: "saboria",
    name: "SaborIA",
    tagline: "Chef pessoal com IA",
    description:
      "Receitas do que você tem em casa, planner semanal, foto → receita e nutri virtual 24h.",
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
    description:
      "Gera legendas, ideias de post, calendário editorial, hashtags e analisa perfis de redes sociais.",
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
    slug: "fitia",
    name: "FitIA",
    tagline: "Treinos com IA",
    description: "Programa de treino gerado pela IA que se adapta ao seu ritmo.",
    icon: Dumbbell,
    status: "soon",
    route: "/apps/fitia",
    tabs: [],
  },
  {
    slug: "grana",
    name: "GranaIA",
    tagline: "Finanças com IA",
    description: "Orçamento, metas e insights financeiros com um copiloto IA.",
    icon: Wallet,
    status: "soon",
    route: "/apps/grana",
    tabs: [],
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
