import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Share2,
  Clock,
  ChevronDown,
  Zap,
  Camera,
  CalendarDays,
  HeartPulse,
  Volume2,
  Refrigerator,
  Timer,
  Check,
  XCircle,
  Play,
  Pause,
  RefreshCcw,
  Lock,
  Users,
  X,
  ShoppingBag,
  Flame,
  UtensilsCrossed,
  Send,
  HelpCircle,
  ChevronRight,
  AlertOctagon,
  BatteryCharging,
  Sliders,
  Stamp,
  CreditCard,
  Gauge,
  Scan,
  MessageCircle,
  Bot,
  Stethoscope,
  Apple,
  Scale,
} from "lucide-react";
import {
  presellAnalyzeRecipe,
  presellNutriChat,
  PresellRecipeOption,
  PresellAnalysisResult,
  PresellNutriResponse,
} from "@/lib/ai.functions";

export const Route = createFileRoute("/presell")({
  head: () => ({
    meta: [
      { title: "NXA Chef — Test Drive Culinário de 7 Dias com Risco Zero" },
      {
        name: "description",
        content:
          "Teste o NXA Chef por 7 dias. Se não economizar pelo menos R$ 100 em delivery e comida reaproveitada, devolvemos 100% do seu dinheiro e cancelamos seu acesso. Acesso completo por R$ 8,90.",
      },
    ],
  }),
  component: PresellSuperPage,
});

// Eventos reais de compra e uso na plataforma
const LIVE_ACTIVITIES = [
  {
    type: "purchase",
    badge: "🟢 Compra Confirmada",
    name: "Mariana R.",
    city: "São Paulo, SP",
    action: "garantiu o Test Drive de 7 Dias do NXA Chef",
    time: "há 1 minuto",
    detail: "Acesso liberado imediatamente",
  },
  {
    type: "usage",
    badge: "⚡ Cozinhando Agora",
    name: "Rodrigo T.",
    city: "Rio de Janeiro, RJ",
    action: "salvou um jantar com frango e queijo na Airfryer em 11 min",
    time: "há 3 minutos",
    detail: "Economia gerada: ~ R$ 48,00",
  },
  {
    type: "usage",
    badge: "🩺 Consulta Nutri IA",
    name: "Beatriz K.",
    city: "Florianópolis, SC",
    action: "consultou a Dra. Clara para adaptar jantar Low Carb sem lactose",
    time: "há 3 minutos",
    detail: "Orientação e macros calculados",
  },
  {
    type: "purchase",
    badge: "🟢 Compra Confirmada",
    name: "Lucas P.",
    city: "Campinas, SP",
    action: "garantiu a condição de R$ 8,90 vitalício",
    time: "há 4 minutos",
    detail: "Vaga do 1º lote reservada",
  },
  {
    type: "usage",
    badge: "📲 Usando no WhatsApp",
    name: "Felipe C.",
    city: "Belo Horizonte, MG",
    action: "gerou Cardápio 7 Dias e enviou lista de compras no WhatsApp",
    time: "há 6 minutos",
    detail: "Orçamento planejado: até R$ 140",
  },
  {
    type: "usage",
    badge: "📸 Foto → Receita",
    name: "Larissa M.",
    city: "Curitiba, PR",
    action: "tirou foto de legumes na bancada e criou Shakshuka em 8 min",
    time: "há 8 minutos",
    detail: "Zero panela extra suja",
  },
  {
    type: "purchase",
    badge: "🟢 Compra Confirmada",
    name: "Camila S.",
    city: "Porto Alegre, RS",
    action: "desbloqueou todos os 7 módulos com garantia de estorno",
    time: "há 10 minutos",
    detail: "Garantia de 7 dias ativa",
  },
];

const INGREDIENTS_DEMO = [
  { id: "ovos", label: "Ovos", emoji: "🥚" },
  { id: "arroz", label: "Arroz de ontem", emoji: "🍚" },
  { id: "tomate", label: "Tomate", emoji: "🍅" },
  { id: "queijo", label: "Queijo", emoji: "🧀" },
  { id: "frango", label: "Sobras de frango", emoji: "🍗" },
  { id: "batata", label: "Batata", emoji: "🥔" },
  { id: "carne", label: "Carne moída", emoji: "🥩" },
  { id: "cenoura", label: "Cenoura", emoji: "🥕" },
];

export function PresellSuperPage() {
  const checkoutUrl = "/apps/saboria/geladeira";

  // Cronômetro regressivo
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 20);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;


  // Simulador com Inteligência Artificial em Tempo Real (OpenAI)
  const [selectedChips, setSelectedChips] = useState<string[]>(["Ovos", "Arroz de ontem", "Queijo"]);
  const [customInput, setCustomInput] = useState("");
  const [cookingMode, setCookingMode] = useState<"standard" | "airfryer" | "one_pot" | "quick">("standard");
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const [aiResult, setAiResult] = useState<PresellAnalysisResult>({
    summary: "Ótima combinação para um jantar rápido! O NXA Chef analisou seus itens e criou 2 opções práticas de restaurante:",
    options: [
      {
        id: "1",
        name: "Arroz de Forno Cremoso Gratinado com Crosta Dourada",
        emoji: "🍚",
        badge: "Opção Mais Rápida (11 min)",
        time: "11 minutos",
        savings: "R$ 48,00 vs iFood",
        mode: "Airfryer ou Frigideira",
        description: "Misture o arroz de ontem com os ovos batidos e queijo. O calor cria uma crosta crocante por fora e um centro ultra cremoso.",
        ingredients: ["2 xícaras de arroz cozido", "2 ovos batidos", "100g de queijo", "Pitada de sal e orégano"],
        steps: [
          "Misture o arroz com os ovos batidos e metade do queijo",
          "Despeje em 1 refratário pequeno ou na própria frigideira",
          "Cubra com o restante do queijo e leve à Airfryer a 180°C por 8 minutos (ou fogo médio na frigideira tampada)",
        ],
      },
      {
        id: "2",
        name: "Omelete Suflê de Queijo Derretido na Frigideira",
        emoji: "🍳",
        badge: "Zero Louça (1 Frigideira)",
        time: "8 minutos",
        savings: "R$ 42,00 vs iFood",
        mode: "1 Frigideira só",
        description: "Bata os ovos vigorosamente para aerar e adicione o queijo em cubos. Textura fofa de bistrô em menos de 8 minutos.",
        ingredients: ["3 ovos", "Queijo picado", "1 colher de manteiga ou azeite"],
        steps: [
          "Bata os ovos com garfo até espumar levemente",
          "Aqueça a frigideira com o azeite e despeje os ovos",
          "Coloque o queijo no centro, dobre ao meio e desligue o fogo",
        ],
      },
    ],
  });

  const [expandedOptionId, setExpandedOptionId] = useState<string | null>("1");

  function toggleChip(label: string) {
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }

  async function handleAnalyzeWithOpenAI() {
    if (selectedChips.length === 0 && !customInput.trim()) return;

    setAnalyzingWithAI(true);
    try {
      const res = await presellAnalyzeRecipe({
        data: {
          userInput: customInput.trim(),
          chips: selectedChips,
          mode: cookingMode,
        },
      });
      if (res && res.options && res.options.length > 0) {
        setAiResult(res);
        setExpandedOptionId(res.options[0].id);
      }
    } catch (err) {
      console.error("Erro ao chamar presellAnalyzeRecipe:", err);
    } finally {
      setAnalyzingWithAI(false);
    }
  }

  // RECURSO 1 DOIDO: "BOTÃO DE PÂNICO DAS 19H30" (MODO SOBREVIVÊNCIA)
  const [panicModeActive, setPanicModeActive] = useState(false);
  const [panicShaking, setPanicShaking] = useState(false);

  function triggerPanicMode() {
    setPanicShaking(true);
    setTimeout(() => {
      setPanicShaking(false);
      setPanicModeActive(true);
    }, 450);
  }

  // RECURSO 2 DOIDO: "TERMÔMETRO INTERATIVO DE PREGUIÇA / CANSAÇO"
  const [lazinessLevel, setLazinessLevel] = useState<25 | 50 | 75 | 100>(75);

  const LAZINESS_DATA = {
    25: {
      title: "Cansaço Leve (25%)",
      desc: "Você ainda aguenta picar uma cebola e usar duas panelas.",
      recipe: "Frango Grelhado Suculento ao Alho com Batata Rústica",
      time: "15 min",
      dishes: "2 panelas",
      tag: "Tranquilo",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    },
    50: {
      title: "Cansaço Moderado (50%)",
      desc: "Trabalhou o dia todo, não quer bagunça na pia.",
      recipe: "Arroz Gratinado de Forno na Airfryer com Crosta de Queijo",
      time: "11 min",
      dishes: "1 refratário só",
      tag: "Modo Airfryer",
      color: "text-teal-400",
      bg: "bg-teal-500/10 border-teal-500/30",
    },
    75: {
      title: "Exausto Pós-Trânsito (75%)",
      desc: "Chegou às 19h40, só quer comer em menos de 10 min e sentar no sofá.",
      recipe: "Omelete Suflê Dourada de 1 Frigideira com Queijo Derretido",
      time: "7 min",
      dishes: "1 frigideira e 1 garfo",
      tag: "Zero Louça",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    100: {
      title: "Modo Zumbi: 'Se eu lavar louça eu choro' (100%)",
      desc: "Zero energia física e mental. Sem fogão, sem faca, sem pia cheia.",
      recipe: "Torta Salgada de Caneca em 3 Minutos de Micro-ondas / Airfryer",
      time: "4 min",
      dishes: "Apenas a caneca que você come",
      tag: "Socorro Extremo",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/30",
    },
  };

  // RECURSO 3 DOIDO: "CARIMBO DE CANCELAMENTO DO IFOOD" NA FATURA
  const [isCardStamped, setIsCardStamped] = useState(false);

  // NUTRICIONISTA IA 24H (DRA. CLARA)
  const [nutriQuestion, setNutriQuestion] = useState("");
  const [nutriGoal, setNutriGoal] = useState<"emagrecer" | "massa" | "saude" | "economizar">("emagrecer");
  const [nutriLoading, setNutriLoading] = useState(false);
  const [isNutriSpeaking, setIsNutriSpeaking] = useState(false);
  const [nutriResult, setNutriResult] = useState<PresellNutriResponse>({
    verdict: "Estratégia 100% liberada à noite!",
    answer:
      "Comer ovos ou proteínas com legumes à noite NÃO engorda e ajuda a evitar os picos de insulina que travam a queima de gordura. O segredo é evitar excesso de carboidratos refinados tarde da noite.",
    practicalTips: [
      "Ovos mexidos ou omelete com tomate e queijo branco garantem saciedade até o amanhecer sem peso no estômago.",
      "Coma pelo menos 1h30 antes de deitar para garantir um sono reparador com digestão leve.",
      "Beba 1 copo de água ou chá calmante (erva-doce ou camomila) para diminuir o apetite emocional.",
    ],
    macros: {
      calories: "~210 kcal",
      protein: "16g proteína",
      carbs: "4g carboidratos",
    },
  });

  async function handleAskNutri(customQ?: string) {
    const questionToAsk = (customQ || nutriQuestion).trim();
    if (!questionToAsk) return;

    setNutriLoading(true);
    try {
      const res = await presellNutriChat({
        data: {
          question: questionToAsk,
          goal: nutriGoal,
        },
      });
      setNutriResult(res);
      if (customQ) {
        setNutriQuestion(customQ);
      }
    } catch (err) {
      console.error("Erro na consulta com a Nutricionista:", err);
    } finally {
      setNutriLoading(false);
    }
  }

  function handleSpeakNutri() {
    if (isNutriSpeaking) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsNutriSpeaking(false);
      return;
    }

    setIsNutriSpeaking(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `Dra. Clara responde: ${nutriResult.verdict}. ${nutriResult.answer}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.05;
      utterance.onend = () => setIsNutriSpeaking(false);
      utterance.onerror = () => setIsNutriSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsNutriSpeaking(false), 4000);
    }
  }


  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#05070c] text-neutral-100 font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Luz ambiente de fundo neon suave */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 opacity-40">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-emerald-600/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-32 h-[500px] w-[500px] rounded-full bg-teal-500/15 blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-amber-500/10 blur-[130px]" />
      </div>

      {/* 1. TOP BAR LIMPA & DIRETA */}
      <div className="relative z-20 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 py-2.5 px-4 text-center text-xs sm:text-sm font-semibold text-emerald-100 border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Test Drive Culinário de 7 Dias: Teste com Risco Zero</span>
          <span className="bg-black/50 px-2 py-0.5 rounded font-mono text-amber-300 font-bold">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="font-bold text-white">• De R$ 97 por apenas R$ 8,90</span>
        </div>
      </div>

      {/* 2. HEADER ELEGANTE COM PROVA SOCIAL AO VIVO */}
      <header className="relative z-20 mx-auto max-w-4xl px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.15 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-neutral-950 font-black shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            👨‍🍳
          </motion.div>
          <div>
            <span className="text-base font-black tracking-tight text-white block leading-none">NXA Chef</span>
            <span className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">Culinária Inteligente</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <Users size={13} className="text-emerald-400" />
            <span><strong>1.482</strong> brasileiros usando hoje</span>
          </div>
          <motion.a
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            href={checkoutUrl}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs px-4 py-2 transition-all shadow-md shadow-emerald-500/20"
          >
            Garantir por R$ 8,90
          </motion.a>
        </div>
      </header>

      {/* 2.5 TICKER CONTÍNUO DE PROVA SOCIAL AO VIVO (ESTILO SAAS / BLOOMBERG) */}
      <div className="relative z-20 w-full overflow-hidden border-y border-white/5 bg-black/50 backdrop-blur-md py-2">
        <div className="flex items-center gap-2 max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1.5 shrink-0 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>AO VIVO</span>
          </div>

          <div className="overflow-hidden w-full select-none">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex items-center gap-8 whitespace-nowrap text-xs text-neutral-300 w-max"
            >
              {[...LIVE_ACTIVITIES, ...LIVE_ACTIVITIES].map((item, idx) => (
                <div key={idx} className="inline-flex items-center gap-2">
                  <span className="text-[11px] font-bold text-white">{item.name}</span>
                  <span className="text-[10px] text-neutral-400">({item.city})</span>
                  <span className="text-emerald-400 font-medium">• {item.action}</span>
                  <span className="text-[10px] text-neutral-500">({item.time})</span>
                  <span className="text-neutral-700 mx-2">|</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* 3. HERO SECTION CLARA E DIRETA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 pt-10 pb-12 px-4 text-center max-w-3xl mx-auto"
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-6 backdrop-blur-md cursor-pointer"
        >
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Garantia de Estorno de 100% caso não aprove em 7 dias</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
          Abra sua geladeira. Digite ou marque o que tem dentro. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
            Seu jantar pronto em 12 minutos sem louça.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto">
          Chega de gastar R$ 60 no iFood por cansaço ou deixar comida estragar na gaveta. 
          Você ativa seu <strong>Período de Teste de 7 Dias por R$ 8,90</strong>. Se não economizar pelo menos R$ 100 na primeira semana, <strong>devolvemos todo o seu dinheiro e cancelamos seu usuário</strong>.
        </p>

        {/* CTA HERO COM EFEITO SALTITANTE */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <motion.a
            whileHover={{ y: -6, scale: 1.04, boxShadow: "0 20px 30px -10px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 14 }}
            href={checkoutUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 px-8 py-4 text-base font-black text-neutral-950 shadow-xl shadow-emerald-500/25 cursor-pointer"
          >
            <span>INICIAR TEST DRIVE DE 7 DIAS POR R$ 8,90</span>
            <ArrowRight size={18} />
          </motion.a>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Lock size={13} className="text-emerald-400" />
            <span>Pagamento Único • Estorno Garantido em 1 Clique • Acesso Imediato</span>
          </div>
        </div>

        {/* 4. SIMULADOR COM IA EM TEMPO REAL + SCANNER LASER NEON */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-left rounded-3xl border border-white/10 bg-neutral-900/80 p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all"
        >
          {/* Luz de destaque animada no topo */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          {/* Scanner Laser Neon Efeito Visual */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent skew-x-12"
          />

          <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-white/10 gap-2">
            <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Scan size={16} className="text-emerald-400 animate-pulse" />
              Scanner Culinário com IA: Marque ou digite o que tem na cozinha
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Conectado ao GPT-4o Mini
            </span>
          </div>

          {/* Chips de Ingredientes com Efeito Saltitante */}
          <div className="flex flex-wrap gap-2 mb-4">
            {INGREDIENTS_DEMO.map((item) => {
              const isSelected = selectedChips.includes(item.label);
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ y: -4, scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 450, damping: 15 }}
                  onClick={() => toggleChip(item.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/30 scale-105"
                      : "bg-neutral-800 text-neutral-300 border border-white/5 hover:border-white/20"
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                  {isSelected && <Check size={12} className="stroke-[3]" />}
                </motion.button>
              );
            })}
          </div>

          {/* Campo Aberto para Digitar QUALQUER Ideia */}
          <div className="mb-4">
            <label htmlFor="custom-recipe-input" className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <span>✍️ Ou digite qualquer coisa da sua despensa ou ideia de prato:</span>
            </label>
            <div className="relative">
              <input
                id="custom-recipe-input"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !analyzingWithAI) handleAnalyzeWithOpenAI();
                }}
                placeholder="Ex: tenho cenoura murcha, atum ralado e creme de leite... ou 'jantar leve em 10 min'"
                className="w-full rounded-xl bg-black/60 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all pr-10"
              />
              <button
                type="button"
                onClick={handleAnalyzeWithOpenAI}
                disabled={analyzingWithAI || (selectedChips.length === 0 && !customInput.trim())}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-40 cursor-pointer"
                title="Consultar IA"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Filtro de Modo Culinário com Botões Saltitantes */}
          <div className="flex flex-wrap items-center gap-2 mb-5 text-xs">
            <span className="text-neutral-400 font-bold mr-1">Preparo preferido:</span>
            {[
              { id: "standard", label: "Geral" },
              { id: "airfryer", label: "💨 Na Airfryer" },
              { id: "one_pot", label: "🍳 1 Frigideira Só" },
              { id: "quick", label: "⚡ 10 minutos" },
            ].map((m) => (
              <motion.button
                key={m.id}
                type="button"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 450, damping: 15 }}
                onClick={() => setCookingMode(m.id as any)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  cookingMode === m.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                    : "bg-white/5 text-neutral-400 border border-white/5 hover:border-white/10"
                }`}
              >
                {m.label}
              </motion.button>
            ))}
          </div>

          {/* Botão de Análise com a OpenAI */}
          <motion.button
            type="button"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={handleAnalyzeWithOpenAI}
            disabled={analyzingWithAI || (selectedChips.length === 0 && !customInput.trim())}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {analyzingWithAI ? (
              <>
                <Sparkles size={16} className="animate-spin text-neutral-950" />
                <span>Consultando IA da OpenAI em tempo real...</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Analisar e Criar Opções com IA em Tempo Real</span>
              </>
            )}
          </motion.button>

          {/* Resumo do Chef */}
          {aiResult.summary && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-xs sm:text-sm text-neutral-300 italic border-l-2 border-emerald-400 pl-3 py-0.5"
            >
              "{aiResult.summary}"
            </motion.p>
          )}

          {/* CARDS ANIMADOS DAS OPÇÕES GERADAS PELA IA (COM PULO E HOVER IMPACTANTE) */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-bold mb-1">
              <span>Opções práticas geradas:</span>
              <span className="text-emerald-400">Passe o mouse ou toque para expandir</span>
            </div>

            <AnimatePresence mode="popLayout">
              {aiResult.options.map((opt, idx) => {
                const isExpanded = expandedOptionId === opt.id;
                return (
                  <motion.div
                    key={opt.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18, delay: idx * 0.1 }}
                    whileHover={{ y: -8, scale: 1.015, boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.15)" }}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      isExpanded
                        ? "border-emerald-400 bg-emerald-950/30 shadow-lg shadow-emerald-500/10"
                        : "border-white/10 bg-neutral-900/60 hover:border-emerald-500/40"
                    }`}
                    onClick={() => setExpandedOptionId(isExpanded ? null : opt.id)}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{opt.emoji}</span>
                          <span className="text-xs font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                            {opt.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={11} /> {opt.time}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                            💰 {opt.savings}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-white">{opt.name}</h4>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{opt.description}</p>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-neutral-400 flex items-center gap-1">
                          <Flame size={13} className="text-orange-400" />
                          <strong>Modo:</strong> {opt.mode}
                        </span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          {isExpanded ? "Ocultar receita" : "Ver ingredientes e preparo"}
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </span>
                      </div>
                    </div>

                    {/* Modo de Preparo e Ingredientes Expansíveis */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-emerald-500/20 bg-black/40 p-4 sm:p-5 text-xs text-neutral-300 space-y-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <span className="font-bold text-white block mb-1">🛒 Ingredientes necessários:</span>
                            <ul className="space-y-1 text-neutral-300 pl-4 list-disc">
                              {opt.ingredients.map((ing, i) => (
                                <li key={i}>{ing}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="font-bold text-white block mb-1">👨‍🍳 Passo a passo rápido:</span>
                            <ol className="space-y-1.5 text-neutral-300 pl-4 list-decimal">
                              {opt.steps.map((st, i) => (
                                <li key={i} className="leading-relaxed">{st}</li>
                              ))}
                            </ol>
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[11px] text-neutral-400">
                              Gerado instantaneamente com base na sua despensa.
                            </span>
                            <a
                              href={checkoutUrl}
                              className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1 text-xs"
                            >
                              Fazer no App por R$ 8,90 →
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.section>

      {/* RECURSO DOIDO 1: O "BOTÃO DE PÂNICO DAS 19H30" */}
      <div className="max-w-4xl mx-auto px-4 my-8">
        <motion.div
          animate={panicShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-neutral-900 to-red-950/20 p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-400 mb-3">
            <AlertOctagon size={14} className="animate-bounce" />
            <span>Recurso Emergencial: "Cheguei Exausto e Não Quero Pensar"</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            O Botão de Pânico das 19h30
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-lg mx-auto">
            Zero paciência hoje? Dê um clique no botão abaixo para ver o algoritmo de sobrevivência cuspir uma receita de 6 minutos sem pensar.
          </p>

          <div className="mt-6 flex flex-col items-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.08, y: -4, boxShadow: "0 0 35px rgba(239, 68, 68, 0.6)" }}
              whileTap={{ scale: 0.92, y: 2 }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              onClick={triggerPanicMode}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-400 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/30 flex items-center gap-2.5 cursor-pointer border-t border-white/20"
            >
              <AlertOctagon size={20} />
              <span>🚨 APERTAR BOTÃO DE EMERGÊNCIA (FOME ZERO ENERGIA)</span>
            </motion.button>

            {/* Resultado do Botão de Pânico */}
            <AnimatePresence>
              {panicModeActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="mt-5 max-w-lg w-full rounded-2xl border-2 border-red-500/60 bg-black/80 p-5 text-left text-xs text-neutral-200 space-y-2 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                    <span className="font-black text-red-400 flex items-center gap-1.5 uppercase text-xs">
                      ⚡ Salvamento Imediato Ativado:
                    </span>
                    <span className="bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded">
                      Pronto em 6 minutos • Zero Louça
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white pt-1">
                    Croque de Frigideira Dourada (Sem Louça)
                  </h4>
                  <p className="text-neutral-300 text-xs">
                    "Pegue 2 fatias de pão, recheie com qualquer queijo ou presunto. Pincele azeite ou manteiga dos dois lados e doure na frigideira bem quente por 3 minutos de cada lado. O queijo borbulha e você come direto no guardanapo."
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[11px]">
                    <span className="text-emerald-400 font-bold">💰 Economizou R$ 64,00 de iFood hoje</span>
                    <a href={checkoutUrl} className="font-bold text-red-400 hover:text-red-300 underline">
                      Desbloquear Modo Pânico no App →
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* RECURSO DOIDO 2: "O TERMÔMETRO DA PREGUIÇA" */}
      <div className="max-w-4xl mx-auto px-4 my-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/10 bg-neutral-900/70 p-6 sm:p-8 backdrop-blur-xl"
        >
          <div className="text-center mb-6">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Personalização Extrema
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
              O Termômetro de Preguiça & Cansaço
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md mx-auto">
              Selecione o seu nível de exaustão agora e veja o NXA Chef calibrar a receita:
            </p>
          </div>

          {/* 4 Níveis com Efeito Saltitante */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {([25, 50, 75, 100] as const).map((lvl) => {
              const item = LAZINESS_DATA[lvl];
              const isSelected = lazinessLevel === lvl;
              return (
                <motion.button
                  key={lvl}
                  type="button"
                  whileHover={{ y: -6, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 15 }}
                  onClick={() => setLazinessLevel(lvl)}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                    isSelected
                      ? `${item.bg} border-amber-400 shadow-lg shadow-amber-500/15 scale-105`
                      : "border-white/5 bg-neutral-950/60 text-neutral-400 hover:border-white/20"
                  }`}
                >
                  <span className="text-lg font-black text-white">{lvl}%</span>
                  <span className="text-xs font-bold mt-1 text-white">{item.tag}</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">{item.time}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Card Dinâmico do Nível Selecionado */}
          <motion.div
            key={lazinessLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-5 ${LAZINESS_DATA[lazinessLevel].bg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`text-xs font-black uppercase ${LAZINESS_DATA[lazinessLevel].color}`}>
                {LAZINESS_DATA[lazinessLevel].title}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-black/50 text-white font-bold px-2 py-0.5 rounded">
                  ⏱️ {LAZINESS_DATA[lazinessLevel].time}
                </span>
                <span className="bg-black/50 text-amber-300 font-bold px-2 py-0.5 rounded">
                  🧼 {LAZINESS_DATA[lazinessLevel].dishes}
                </span>
              </div>
            </div>

            <h4 className="text-base sm:text-lg font-black text-white">
              {LAZINESS_DATA[lazinessLevel].recipe}
            </h4>
            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              {LAZINESS_DATA[lazinessLevel].desc}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* LINHA DE TRANSIÇÃO NEON SUAVE */}
      <div className="max-w-4xl mx-auto px-4 my-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>

      {/* 5. SEÇÃO DE MÁXIMA CREDIBILIDADE: COMO FUNCIONA O PERÍODO DE TESTE & ESTORNO EM 7 DIAS */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-14 px-4 bg-gradient-to-b from-neutral-900/60 to-neutral-950 border-y border-white/10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Transparência Total & Risco Zero
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Como funciona o seu Test Drive de 7 Dias com Estorno Garantido
            </h2>
            <p className="text-sm text-neutral-300 mt-2 max-w-2xl mx-auto">
              Nós assumimos 100% do risco para você testar a ferramenta sem receio. Veja exatamente como funciona o processo:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Passo 1 com Salto */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02, boxShadow: "0 15px 25px -5px rgba(16, 185, 129, 0.2)" }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6 relative cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-white mb-2">Você ativa seu Test Drive</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Pague apenas R$ 8,90 pelo lote promocional. Seu login é liberado no mesmo segundo com acesso ilimitado a todos os 7 recursos do app.
              </p>
            </motion.div>

            {/* Passo 2 com Salto */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02, boxShadow: "0 15px 25px -5px rgba(20, 184, 166, 0.2)" }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6 relative cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-400 font-black flex items-center justify-center text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-white mb-2">Você usa por 7 dias na sua rotina</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Marque ingredientes, tire foto da geladeira, cozinhe ouvindo o viva-voz e mande listas no WhatsApp. Veja quanto economizou em delivery e comida não jogada fora.
              </p>
            </motion.div>

            {/* Passo 3 com Salto */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 30px -5px rgba(16, 185, 129, 0.3)" }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="rounded-2xl border-2 border-emerald-400/80 bg-emerald-950/20 p-6 relative shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-400 text-neutral-950 font-black flex items-center justify-center text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-emerald-300 mb-2">Amou ou 100% Estornado</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Se dentro de 7 dias você achar que o app não se pagou, basta 1 mensagem no nosso suporte. Devolvemos 100% do seu dinheiro e seu usuário é cancelado no sistema. Sem perguntas e sem ressentimentos.
              </p>
            </motion.div>
          </div>

          {/* Box de Confiança Oficial */}
          <motion.div
            whileHover={{ y: -4, borderColor: "rgba(16, 185, 129, 0.6)" }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="mt-8 rounded-2xl border border-emerald-500/30 bg-neutral-900/90 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <RefreshCcw size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Garantia Incondicional "Desperdício Zero"</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Estorno efetuado diretamente na fatura do cartão ou via Pix em até 24 horas úteis.
                </p>
              </div>
            </div>

            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href={checkoutUrl}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs px-5 py-2.5 transition-all shadow-md shrink-0 cursor-pointer"
            >
              Começar Test Drive Agora →
            </motion.a>
          </motion.div>
        </div>
      </motion.section>

      {/* LINHA DE TRANSIÇÃO NEON */}
      <div className="max-w-4xl mx-auto px-4 my-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
      </div>

      {/* 6. A BATALHA VISUAL: CHATGPT VS NXA CHEF (COM EFEITO DE PULO) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-14 px-4 bg-neutral-900/40 border-b border-white/5"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Comparativo Real
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              "Por que não usar o ChatGPT de graça?"
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Veja o que acontece na prática quando você tenta cozinhar com uma IA genérica:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card ChatGPT com Pulo */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02, boxShadow: "0 15px 25px -5px rgba(239, 68, 68, 0.2)" }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <XCircle size={15} /> ChatGPT Genérico
                </span>
                <span className="text-[10px] text-red-300 font-semibold bg-red-500/20 px-2 py-0.5 rounded">
                  Teórico & Frustrante
                </span>
              </div>
              <p className="text-xs text-neutral-300 italic mb-3 bg-black/40 p-2.5 rounded border border-red-500/10">
                "Você tem ovo e arroz? Prepare um Risoto Milanês com vinho branco seco, chalotas francesas, manteiga clarificada e azeite trufado..."
              </p>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-center gap-1.5 text-red-300">
                  <XCircle size={13} className="shrink-0 text-red-400" /> Pede ingredientes caros que ninguém tem na despensa
                </li>
                <li className="flex items-center gap-1.5 text-red-300">
                  <XCircle size={13} className="shrink-0 text-red-400" /> Receitas longas de 40 min que sujam várias panelas
                </li>
                <li className="flex items-center gap-1.5 text-red-300">
                  <XCircle size={13} className="shrink-0 text-red-400" /> Não fala no viva-voz (você engordura a tela do celular)
                </li>
              </ul>
            </motion.div>

            {/* Card NXA Chef com Pulo */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 30px -5px rgba(16, 185, 129, 0.3)" }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-950/20 p-5 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> NXA Chef Especializado
                </span>
                <span className="text-[10px] text-emerald-950 font-black bg-emerald-400 px-2 py-0.5 rounded">
                  Feito pro Brasil
                </span>
              </div>
              <p className="text-xs text-neutral-200 font-medium mb-3 bg-black/50 p-2.5 rounded border border-emerald-500/20">
                "Arroz de Forno Cremoso Gratinado na Airfryer. 11 minutos. Misture com ovo e queijo. 1 frigideira só. Economia: R$ 48,00 vs delivery."
              </p>
              <ul className="space-y-2 text-xs text-neutral-200">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" /> Calibrado para arroz amanhecido, sobras e tempero caseiro
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" /> Modo 1 panela só e Airfryer: menos de 90s de louça
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" /> Chef no Viva-Voz Real: dita tudo no áudio hands-free
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* RECURSO DOIDO 3: A FATURA DO CARTÃO INTERATIVA COM CARIMBO DE CANCELAMENTO */}
      <div className="max-w-3xl mx-auto px-4 my-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/10 bg-neutral-950 p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <CreditCard size={16} className="text-red-400" />
              Extrato Real do Cansaço: Fatura do Cartão de Crédito
            </span>
            <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">
              Sem o NXA Chef
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-white/5 text-neutral-300">
              <span>04/OUT • iFood Burger Artesanal & Batata</span>
              <span className="text-red-400 font-bold">R$ 68,90</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white/5 text-neutral-300">
              <span>09/OUT • Pizza Grande de Domingo</span>
              <span className="text-red-400 font-bold">R$ 74,50</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white/5 text-neutral-300">
              <span>15/OUT • Delivery Japonês Express</span>
              <span className="text-red-400 font-bold">R$ 89,00</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white/5 text-neutral-300">
              <span>22/OUT • Legumes e queijo estragados no lixo</span>
              <span className="text-red-400 font-bold">~ R$ 65,00</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Total Desperdiçado no Mês:</span>
            <span className="text-xl font-black text-red-400">R$ 297,40</span>
          </div>

          {/* O Carimbo 3D que cai com impacto */}
          <div className="mt-6 text-center">
            {!isCardStamped ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCardStamped(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs shadow-lg cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Stamp size={16} />
                <span>Carimbar Cancelamento do iFood com NXA Chef</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 2.5, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ type: "spring", stiffness: 500, damping: 12 }}
                className="inline-block border-4 border-emerald-400 text-emerald-400 font-black uppercase text-base sm:text-lg px-6 py-2 rounded-2xl tracking-widest bg-emerald-950/60 shadow-2xl shadow-emerald-500/40"
              >
                ✓ CANCELADO PELO NXA CHEF • +R$ 297 NO BOLSO!
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 7. RECURSO EXCLUSIVO: NUTRICIONISTA IA TREINADA 24H (CONVERSE A QUALQUER HORA) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-14 px-4 max-w-4xl mx-auto border-t border-white/5"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-bold text-pink-300 mb-3">
            <HeartPulse size={14} className="text-pink-400 animate-pulse" />
            <span>Consulta Clínica Particular: R$ 200 • No NXA Chef: 24h Ilimitada</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Tenha uma Nutricionista IA Treinada no seu Bolso 24h por Dia
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-2xl mx-auto leading-relaxed">
            Dúvidas no meio da noite? Não sabe se o prato engorda, como substituir itens por causa de lactose ou diabetes, ou como bater proteínas? A <strong>Dra. Clara</strong> está online agora para conversar com você em tempo real.
          </p>
        </div>

        {/* Simulador Interativo do Chat com a Nutri */}
        <motion.div
          whileHover={{ y: -6, boxShadow: "0 25px 40px -10px rgba(236, 72, 153, 0.2)" }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="rounded-3xl border border-pink-500/30 bg-neutral-900/80 p-5 sm:p-7 backdrop-blur-xl relative overflow-hidden shadow-2xl"
        >
          {/* Header do Chat */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xl shadow-md shadow-pink-500/30">
                  🩺
                </div>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-neutral-950 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Dra. Clara</span>
                  <span className="text-[10px] font-bold bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">
                    Nutri Clínica IA
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  ● Disponível 24 horas por dia • Sem limites de perguntas
                </span>
              </div>
            </div>

            {/* Seletor de Foco do Usuário */}
            <div className="flex items-center gap-1.5 text-xs">
              {[
                { id: "emagrecer", label: "🔥 Emagrecer" },
                { id: "massa", label: "💪 Músculo/Fit" },
                { id: "saude", label: "🥗 Saúde/Digestão" },
                { id: "economizar", label: "💰 Economia" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setNutriGoal(g.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    nutriGoal === g.id
                      ? "bg-pink-500 text-white shadow-sm shadow-pink-500/40"
                      : "bg-white/5 text-neutral-400 hover:text-white"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dúvidas Frequentes Rápidas (Chips com Pulo) */}
          <div className="mb-4">
            <span className="text-[11px] text-neutral-400 font-bold block mb-2">
              Clique em uma dúvida rápida para testar a resposta científica imediata:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "🥑 Ovos com queijo à noite atrapalham emagrecer?", q: "Comer ovos com queijo à noite atrapalha o emagrecimento?" },
                { label: "🥛 Intolerância à lactose: como substituir?", q: "Tenho intolerância à lactose. Como substituir o queijo e creme sem perder a cremosidade?" },
                { label: "💪 Como bater 25g de proteína barata?", q: "Como bater 25g de proteína no jantar usando sobras e comida barata da despensa?" },
                { label: "🩸 Glicose alta: como comer arroz amanhecido?", q: "Tenho medo de pico de glicose com arroz amanhecido. Qual a melhor combinação?" },
              ].map((item, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 15 }}
                  onClick={() => handleAskNutri(item.q)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-white/5 hover:border-pink-500/30 text-xs text-neutral-300 font-medium transition-all text-left cursor-pointer"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Campo de Pergunta Aberta */}
          <div className="mb-5">
            <div className="relative">
              <input
                type="text"
                value={nutriQuestion}
                onChange={(e) => setNutriQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !nutriLoading) handleAskNutri();
                }}
                placeholder="Ex: 'Tenho refluxo e ovo mexido me faz mal?' ou 'O que comer no pré-treino com banana?'"
                className="w-full rounded-2xl bg-black/60 border border-white/15 px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-all pr-12"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAskNutri()}
                disabled={nutriLoading || !nutriQuestion.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-95 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-pink-500/30"
                title="Perguntar à Nutri"
              >
                <Send size={15} />
              </motion.button>
            </div>
          </div>

          {/* Card de Resposta da Dra. Clara */}
          <AnimatePresence mode="wait">
            <motion.div
              key={nutriResult.verdict + (nutriLoading ? "loading" : "done")}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-pink-500/30 bg-black/60 p-4 sm:p-5 space-y-3.5"
            >
              {nutriLoading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-pink-300">
                  <Sparkles size={24} className="animate-spin text-pink-400" />
                  <span className="text-xs font-semibold">Dra. Clara está calculando os macros e redigindo sua orientação...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div className="inline-flex items-center gap-2 bg-pink-500/15 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-black text-pink-300">
                      <span>🩺 Veredito:</span>
                      <span className="text-white">{nutriResult.verdict}</span>
                    </div>

                    {/* Botão de Áudio Narrado pela Nutri */}
                    <button
                      type="button"
                      onClick={handleSpeakNutri}
                      className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 px-2.5 py-1 rounded-lg border border-pink-500/20 transition-all cursor-pointer"
                    >
                      {isNutriSpeaking ? <Pause size={13} className="text-pink-300" /> : <Play size={13} className="text-pink-300" />}
                      <span>{isNutriSpeaking ? "Pausar Voz" : "Ouvir no Viva-Voz"}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                    "{nutriResult.answer}"
                  </p>

                  {/* 3 Dicas Práticas da Nutri */}
                  {nutriResult.practicalTips && nutriResult.practicalTips.length > 0 && (
                    <div className="bg-neutral-900/60 rounded-xl p-3 border border-white/5 space-y-1.5">
                      <span className="text-[11px] font-bold text-pink-300 block uppercase tracking-wide">
                        💡 Recomendações Práticas para a sua Cozinha:
                      </span>
                      {nutriResult.practicalTips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                          <CheckCircle2 size={14} className="text-pink-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Macros Estimados */}
                  {nutriResult.macros && (
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/5 text-xs gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-400 font-medium">Balanço Nutricional:</span>
                        <span className="bg-white/5 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                          🔥 {nutriResult.macros.calories}
                        </span>
                        <span className="bg-white/5 text-teal-300 px-2 py-0.5 rounded font-mono font-bold">
                          🥩 {nutriResult.macros.protein}
                        </span>
                        <span className="bg-white/5 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          🍞 {nutriResult.macros.carbs}
                        </span>
                      </div>
                      <a
                        href={checkoutUrl}
                        className="text-xs font-bold text-pink-400 hover:text-pink-300 underline underline-offset-2 flex items-center gap-1"
                      >
                        Desbloquear Conversas Ilimitadas por R$ 8,90 →
                      </a>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Banner de Quebra de Objeção: Economia em Consulta */}
          <div className="mt-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-neutral-950 to-neutral-900 border border-pink-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Scale size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Sem mensalidade de academia e sem pagar R$ 200 por consulta
                </span>
                <span className="text-[11px] text-neutral-400">
                  Tire dúvidas sempre que for cozinhar, planeje refeições saudáveis e economize comendo bem.
                </span>
              </div>
            </div>

            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href={checkoutUrl}
              className="rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs px-4 py-2 transition-all shadow-md shadow-pink-500/20 shrink-0 cursor-pointer"
            >
              Garantir Nutri 24h por R$ 8,90
            </motion.a>
          </div>
        </motion.div>
      </motion.section>


      {/* 8. OS 7 RECURSOS DA SUÍTE CULINÁRIA (COM PULO ALTO EM CADA CARD) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-14 px-4 max-w-4xl mx-auto border-t border-white/5"
      >
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Ecossistema Completo
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Tudo o que você leva no pacote de R$ 8,90:
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Sete ferramentas inteligentes reunidas em um único acesso vitalício:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Refrigerator,
              title: "1. Geladeira Inteligente",
              desc: "Marque o que tem na cozinha e receba receitas práticas com economia estimada na hora.",
              color: "text-emerald-400",
            },
            {
              icon: Camera,
              title: "2. Foto → Receita",
              desc: "Aponte a câmera para os restos da bancada ou gaveta e a IA identifica e monta a receita.",
              color: "text-teal-400",
            },
            {
              icon: CalendarDays,
              title: "3. Cardápio Semanal de 7 Dias",
              desc: "Planeje o almoço e janta da semana respeitando seu limite de orçamento no mercado.",
              color: "text-amber-400",
            },
            {
              icon: Share2,
              title: "4. Lista no WhatsApp em 1 Clique",
              desc: "Envie a lista de mercado organizada por corredor direto para o WhatsApp do marido ou esposa.",
              color: "text-emerald-400",
            },
            {
              icon: Volume2,
              title: "5. Chef no Viva-Voz",
              desc: "Áudio narrando o passo a passo para você cozinhar sem sujar a tela com dedos de azeite.",
              color: "text-indigo-400",
            },
            {
              icon: HeartPulse,
              title: "6. Nutri 24h & Macros",
              desc: "Tire dúvidas de calorias, substituições saudáveis e adaptações para dietas Low Carb ou Fit.",
              color: "text-pink-400",
            },
            {
              icon: Timer,
              title: "7. Modo Flash (10 Minutos)",
              desc: "Receitas ultra-rápidas de 3 passos para quem chega tarde e exausto do trabalho.",
              color: "text-orange-400",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  boxShadow: "0 20px 30px -10px rgba(16, 185, 129, 0.25)",
                  borderColor: "rgba(16, 185, 129, 0.4)",
                }}
                transition={{ type: "spring", stiffness: 450, damping: 15 }}
                className="rounded-2xl border border-white/5 bg-neutral-900/50 p-5 flex flex-col justify-between transition-all cursor-pointer group"
              >
                <div>
                  <div className={`p-2.5 rounded-xl bg-white/5 w-fit ${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 9. COMPARATIVO DE CUSTO (O IFOOD VS NXA CHEF) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-14 px-4 max-w-3xl mx-auto border-t border-white/5"
      >
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            A Matemática do seu Bolso
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Quanto custa a sua preguiça hoje?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 450, damping: 15 }}
            className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5 text-center cursor-pointer"
          >
            <span className="text-xs font-bold text-red-400 uppercase tracking-wide">1 Jantar no iFood</span>
            <div className="text-3xl font-black text-red-400 mt-2">R$ 65,00</div>
            <p className="text-xs text-neutral-400 mt-2">
              Espera de 50 minutos, comida morna, culpa e comida na sua geladeira estragando na gaveta.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 30px -5px rgba(16, 185, 129, 0.3)" }}
            transition={{ type: "spring", stiffness: 450, damping: 15 }}
            className="rounded-2xl border-2 border-emerald-400 bg-emerald-950/20 p-5 text-center shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Test Drive NXA Chef</span>
            <div className="text-3xl font-black text-emerald-400 mt-2">R$ 8,90</div>
            <p className="text-xs text-neutral-200 mt-2 font-medium">
              Jantares prontos em 12 minutos com comida que já está paga. Se não gostar, você recupera 100% do valor.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* 10. O BOX DA OFERTA (IRRESISTÍVEL COM GARANTIA DE ESTORNO) */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-16 px-4 max-w-lg mx-auto"
      >
        <motion.div
          whileHover={{ y: -6, boxShadow: "0 25px 40px -10px rgba(16, 185, 129, 0.3)" }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="rounded-3xl border-2 border-emerald-400 bg-neutral-950 p-7 sm:p-9 text-center shadow-2xl shadow-emerald-500/20 relative"
        >
          <span className="rounded-full bg-emerald-400 px-4 py-1 text-xs font-black uppercase text-neutral-950 inline-block mb-3">
            Acesso Completo aos 7 Recursos
          </span>

          <h3 className="text-2xl sm:text-3xl font-black text-white">
            NXA Chef Pro Vitalício
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Pagamento único • 7 dias de garantia de estorno • Sem mensalidade
          </p>

          <div className="my-6 space-y-2 text-left text-xs sm:text-sm text-neutral-200">
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> Geladeira Inteligente com despensa 1-toque</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> Modo 1 Panela Só e Airfryer (Zero Louça)</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> Foto vira Receita Instantânea</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> Cardápio Semanal de 7 Dias com teto de gastos</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> Exportação de lista de compras pro WhatsApp</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> Chef no Viva-Voz Hands-Free</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> Nutricionista Virtual 24h & Macros</div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="text-xs text-neutral-500 line-through">De R$ 97,00 por apenas</div>
            <div className="text-4xl sm:text-5xl font-black text-white mt-1">
              R$ 8<span className="text-2xl text-emerald-400">,90</span>
            </div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">
              Menos de R$ 0,30 por dia • Liberação Imediata
            </div>

            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href={checkoutUrl}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-neutral-950 py-3.5 text-sm sm:text-base font-black shadow-lg shadow-emerald-500/25 transition-transform cursor-pointer"
            >
              <span>GARANTIR MEU ACESSO COM ESTORNO GARANTIDO</span>
              <ArrowRight size={18} />
            </motion.a>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Garantia de 7 Dias: Devolvemos seu dinheiro e cancelamos seu usuário</span>
          </div>
        </motion.div>
      </motion.section>

      {/* 11. FAQ LIMPO COM DESTAQUE PARA O ESTORNO */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-12 px-4 max-w-2xl mx-auto border-t border-white/5"
      >
        <h2 className="text-xl sm:text-2xl font-black text-white text-center mb-6">Dúvidas Frequentes</h2>

        <div className="space-y-2.5">
          {[
            {
              q: "Como funciona o estorno caso eu não goste?",
              a: "É 100% descomplicado: você tem 7 dias completos para testar o NXA Chef. Se achar que não economizou em delivery ou não gostou de qualquer detalhe, basta mandar 1 mensagem para o nosso suporte. Nós fazemos o estorno integral de 100% do seu valor e desativamos o seu usuário no sistema. O risco do teste é todo nosso.",
            },
            {
              q: "O acesso de R$ 8,90 é pagamento único ou tem mensalidade?",
              a: "Nesta oferta especial de lançamento, é um pagamento único de R$ 8,90 para liberar todos os 7 recursos sem cobranças mensais.",
            },
            {
              q: "A Nutricionista IA realmente responde qualquer dúvida e calcula macros?",
              a: "Sim! A Dra. Clara foi treinada especificamente em nutrição clínica e culinária prática brasileira. Você pode conversar com ela 24 horas por dia para tirar dúvidas de emagrecimento, ganho de massa muscular, substituições para intolerantes (sem glúten/lactose), controle de glicose e estimativa de calorias e proteínas com o que você já tem em casa.",
            },
            {
              q: "Preciso saber cozinhar para usar?",
              a: "Não! O app explica tudo em passos curtos e simples, com quantidades exatas e tempo no fogo ou na Airfryer.",
            },
            {
              q: "E se eu tiver poucos ingredientes na geladeira?",
              a: "Essa é a especialidade do NXA Chef. Mesmo com 2 itens simples (ex: ovo e tomate), a IA cria opções deliciosas e rápidas.",
            },
            {
              q: "Como recebo o acesso?",
              a: "Imediatamente após a confirmação do pagamento, você é redirecionado direto para o aplicativo para começar a usar no mesmo segundo.",
            },
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-white/5 bg-neutral-900/40 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180 text-emerald-400" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-white/5 pt-2">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-neutral-500">
        © 2026 NXA Chef. Todos os direitos reservados.
      </footer>
    </div>
  );
}
