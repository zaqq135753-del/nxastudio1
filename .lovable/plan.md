# NXA Suite → Redesign + Modelo Base/Prime por app

Escopo grande. Vou entregar em 4 ondas para caber em revisões incrementais, sem quebrar a lógica atual dos apps.

## Onda 1 — Fundamentos comerciais (Base + Prime por app)

**Registry**
- `src/apps/registry.ts`: adicionar `pricing: { base: { price, features[] }, prime: { price, features[] } }` para os 10 apps, com as copies e features do briefing.
- Nova função `hasPrime(slug)` além do `hasEntitlement(slug)`.

**Entitlements**
- Migration: coluna `tier text default 'base' check (tier in ('base','prime'))` em `app_entitlements`.
- `claimTrial(slug, tier)` aceita tier; trial padrão continua Base 7 dias.
- Helper `useEntitlement(slug)` retorna `{ status: 'active'|'trial'|'locked'|'available', tier: 'base'|'prime'|null, trialEndsAt }`.

**Gate global de recursos Prime**
- `<LockedFeature slug feature>`: envolve qualquer botão/área Prime; se não Prime abre `<UpsellModal>`.
- `PrimeBadge`, `TrialBanner` prontos para reutilização.

## Onda 2 — Redesign visual (design system)

**Tokens (`src/styles.css`)**
- Paleta nova (fora do roxo genérico): base neutra quente + acento único por tema (Light: âmbar profundo; Paper: tinta+ocre; Dark: verde-oliva elétrico ou cobre — escolho um coerente com "Culinary Editorial" que já existe).
- Tipografia: manter Inter body + display forte (ex.: Fraunces ou Instrument Serif para editorial premium).
- Tokens de superfície: `--surface-1/2/3`, `--glass`, `--ring-prime` (gradiente sutil só para elementos Prime), sombras longas suaves.
- Remover overlays escuros pesados dos tiles atuais; usar mais respiro.

**Componentes**
- `AppCard` reescrito: nome, subtítulo, imagem, `StatusPill` (Ativo/Trial/Prime/Bloqueado/Disponível), CTA contextual, indicador de valor ("3 sugestões hoje").
- `PricingCard` (Base + Prime lado a lado) e `FeatureComparison` (tabela ✓/✓).
- `UpsellModal`, `PrimeBadge`, `TrialBanner`, `LockedFeature` estilizados.

## Onda 3 — Dashboard como centro de comando

`src/routes/hub.tsx` reorganizado em seções:
1. Saudação personalizada + status trial/assinatura.
2. **Continue de onde parou** (app mais usado + próxima ação real puxada dos dados do app).
3. **Seus apps ativos** — cards com indicador de valor real.
4. **Próximas ações** (agregado de streaks/lembretes/agente).
5. **Descubra outros apps** — cards com CTA "Começar teste grátis".
6. **Sua jornada** — XP, streak, badges (compacto).
- Header: mic global + sino + memória + afiliados agrupados num cluster limpo.

## Onda 4 — Landings + Checkout por app

**Landing** (`src/routes/assinar.$slug.tsx` refeita)
- Hero, frase de impacto, CTA "Começar teste grátis" + "Ver recursos Prime".
- "O que esse app faz" (bullets do registry).
- `PricingCard` Base + `PricingCard` Prime.
- `FeatureComparison` Base vs Prime.
- Exemplos visuais (screenshots reais do app dentro da plataforma).
- FAQ curta (3–4 perguntas por app, geradas por template).
- CTA final fixo no rodapé em mobile.

**Fluxo de upgrade**
- `/assinar/$slug` → clicou "Assinar" → aciona `claimTrial(slug,'base')` → `<UpsellModal>` "Adicionar [App] Prime?" → "Adicionar Prime" (`claimTrial(slug,'prime')`) ou "Continuar sem Prime" → redireciona pro app.

**Gates aplicados por app**
- SaborIA: Planner semanal, Geladeira foto, Scanner despensa, PDF cardápio → Prime.
- SocialIA: Calendário editorial, análise de @, packs, export PDF/PPTX → Prime.
- (mesma lógica nos outros 8, seguindo o briefing).
- Botões `RealtimeCallButton`, `MediaTab`, `MemoryPanel` avançado → `<LockedFeature>` quando Base.

**Copies de erro amigáveis**
- Substituir "A IA retornou uma resposta inválida" e similares por: "Ainda estou preparando suas sugestões." / "Não consegui gerar agora. Tente de novo."

## Fora de escopo (intencional)
- Pagamento real (Stripe/Paddle): trial 7d continua como está; quando você quiser cobrar de verdade eu ligo depois.
- Nova lógica de IA nos apps — só camada comercial + visual.
- Não vou tocar arquivos auto-gerados nem alterar auth existente.

## Ordem de execução sugerida
Faço **Onda 1 + Onda 2** juntas primeiro (fundação), depois você valida o visual, e sigo com **Onda 3 + Onda 4**. Se preferir tudo de uma vez, sigo direto.

Responde só: **"1+2"**, **"3+4"**, **"tudo"** ou ajustes.
