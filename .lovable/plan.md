# SaborIA 2.0 — Plano de Reformulação Premium

Objetivo: transformar o app atual (funcional mas genérico) em um produto **vendável**, com identidade visual única, IA presente em cada interação, backend real e um fluxo de auth memorável.

---

## 1. Nova Identidade Visual (fim do "dark genérico laranja")

**Direção proposta — "Culinary Editorial":**
- Base off-black quente `#0E0B08` + camadas com textura sutil (grain/noise SVG).
- Paleta comestível: saffron `#F5A524`, tomato `#E23E3E`, matcha `#7BA05B`, cream `#F4EBDD`.
- Tipografia: **Fraunces** (display serif editorial, com opsz variável) + **Geist** (UI) + **JetBrains Mono** (dados nutricionais).
- Micro-interações: transições spring (framer-motion), skeleton com shimmer, haptic-feel em botões, ícones custom (Lucide + Phosphor duotone).
- Componentes assinatura: cards "receita" estilo revista com número da edição, chips com halo colorido por macronutriente, gradientes mesh em heros.

Alternativa (a decidir): "Neo-Brutalist Kitchen" — cores saturadas, bordas grossas, sombras hard. Sigo com Editorial por padrão salvo objeção.

---

## 2. Login Inovador — "Passwordless + Palate Onboarding"

- **Magic link** por e-mail + **Google** (Lovable Cloud auth).
- Após primeiro login, **onboarding conversacional com IA** (3 min): a Nutri pergunta objetivo, restrições, ingredientes que odeia, nível de cozinha, orçamento — vira um **Perfil de Paladar** (JSON persistido) que alimenta TODAS as gerações depois.
- Tela de auth: split-screen com vídeo de fundo (cinemagraph de comida em loop, WebM leve) + card glass com magic link. Estado "verifique seu e-mail" com animação de envelope.

---

## 3. IA em Todas as Telas (não só nas 4 já existentes)

| Tela | IA nova |
|---|---|
| **Home** | Feed personalizado ("Boa noite, Léo — 3 receitas pro seu humor hoje"), gerado com base no Perfil + horário + clima (via API pública). Botão "Surpreenda-me" (1 clique → receita completa). |
| **Geladeira** | OCR de nota fiscal / foto da geladeira (Gemini Vision) → auto-preenche ingredientes. Sugestão de "o que vence primeiro". |
| **Foto** | Além de identificar prato: **modo "refazer mais saudável"** e **modo "versão fitness/vegana/kids"**. |
| **Planner** | Geração streaming (usuário vê o plano aparecendo dia a dia). Exporta lista de compras agrupada por corredor de mercado. Integra com o Perfil. |
| **Nutri chat** | **Voz** (Web Speech API + TTS via Lovable AI). Anexar foto da refeição pra análise instantânea de macros. Memória persistente entre sessões. |
| **Novo: Cozinhar ao Vivo** | Modo hands-free: TTS lê passo a passo, usuário diz "próximo"/"repetir", timer automático detectado do texto ("cozinhe por 10 min" vira botão de timer). |

---

## 4. Backend Real (Lovable Cloud)

- Tabelas: `profiles`, `palate_profile`, `saved_recipes`, `meal_plans`, `pantry_items`, `chat_threads`, `chat_messages`, `usage_counters`.
- RLS em tudo (`auth.uid()`).
- Roles: `user`, `pro`, `admin` em tabela `user_roles` separada + função `has_role`.
- Persistência: cada receita gerada é salva com thumbnail (gerada por Lovable AI image gen se o usuário quiser), pode ser favoritada, remixada, compartilhada por link público (`/r/:slug`).
- Contadores de uso pra futura monetização (free tier = 5 receitas/dia, pro = ilimitado).

---

## 5. Monetização (estrutura pronta, cobrança opcional)

- Paywall suave no 6º uso do dia → tela "SaborIA Pro" (R$ 19,90/mês).
- Deixo os hooks e a UI prontos; ativação real do Stripe/Paddle fica pra quando você aprovar (pergunto qual usar).

---

## 6. Extras que fazem parecer produto de verdade

- **PWA instalável** com ícone, splash, offline shell.
- **Compartilhamento**: OG image dinâmica por receita (gerada server-side).
- **SEO**: rotas públicas `/r/:slug` com metadata rica + JSON-LD `Recipe`.
- **i18n-ready** (pt-BR default, estrutura pra en).
- **Acessibilidade**: contraste AA, foco visível, aria-labels, respect prefers-reduced-motion.

---

## Ordem de execução

1. Ativar Lovable Cloud + schema + auth + onboarding conversacional.
2. Novo design system (tokens, fontes, componentes base).
3. Refazer Home + Auth com nova identidade.
4. Migrar 4 telas existentes pro novo DS + persistência + streaming.
5. Adicionar Cozinhar ao Vivo + OCR geladeira + voz no Nutri.
6. Compartilhamento público + PWA + SEO.
7. Estrutura de paywall (sem cobrança ativa até você escolher provedor).

---

## Decisões que preciso de você antes de codar

1. **Direção visual**: Culinary Editorial (recomendo) ou Neo-Brutalist Kitchen?
2. **Auth**: magic link + Google (recomendo) ou adicionar Apple também?
3. **Monetização agora ou depois?** Se agora: Stripe ou Paddle?
4. **Nome/tom**: mantém "SaborIA" ou quer explorar outro?

Aprova esse escopo? Assim que confirmar (e responder as 4 perguntas) eu executo tudo em sequência.