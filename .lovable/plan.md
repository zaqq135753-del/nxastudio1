# Evolução visual NXA Suite — "AI lifestyle premium"

Objetivo: dar mais vida, identidade por app e microinterações à plataforma, mantendo o polish premium e todas as rotas/lógica atuais.

## Onda 1 — Fundação de estilo (tokens + motion)

Editar `src/styles.css` para adicionar a camada de identidade:

- **Paleta por app** como CSS vars: `--app-chef-a/b/c`, `--app-social-*`, `--app-pet-*`, `--app-fluency-*`, `--app-glow-*`, `--app-grana-*`, `--app-fit-*`, `--app-style-*`, `--app-cosmos-*`, `--app-travel-*` (cores da sec. 3 do brief).
- **Gradientes utilitários** por app (`--grad-chef`, etc.) + `--ring-prime` (dourado/champagne) + `--glow-app-*`.
- **Utilitários novos** via `@utility`: `.card-glow`, `.card-gradient-border`, `.hover-lift-pro`, `.press`, `.shimmer-premium`, `.pulse-ai`, `.mesh-hero`, `.aurora-motion`, `.stagger-in`.
- **Keyframes**: `float-orb`, `pulse-ai`, `shimmer`, `sound-wave`, `confetti-pop`.
- Respeitar `prefers-reduced-motion` (bloco global).

## Onda 2 — Config visual por app

Estender `src/apps/config.ts` (sem quebrar consumidores) com:

- `emoji`, `emojiSet: string[4]`, `accent: { from,to,ring,glow }`, `mission: { emoji, title, subtitle, cta, route }`, `sectionTitles` (Comece por aqui / Ações rápidas / Seu progresso / Modo Prime / Histórico).

Todos campos opcionais — código atual continua funcionando.

## Onda 3 — Novos componentes visuais

Criar em `src/components/nxa/`:

- `GradientBorderCard.tsx` — wrapper reutilizável (borda gradient + glow).
- `AnimatedAppCard.tsx` — card de app com bolha do ícone, hover lift, seta animada, badge, cover com zoom.
- `DailyMissionCard.tsx` — hero de "Missão de hoje" por app (emoji grande, título dor-first, CTA).
- `AICommandBar.tsx` (refinar existente) — glow ao focar, sugestões com emoji.
- `SectionHeader.tsx` — kicker uppercase + título editorial + ação opcional.
- `EmptyStateCard.tsx` (refinar) — emoji do nicho + CTA vivo.
- `PrimeBadge.tsx` / `LockedPrimeCard.tsx` / `PrimeUpsellCard.tsx` (refinar) — borda dourada, ✨, shimmer.
- `StreakBadge.tsx` — 🔥 + contador animado.
- `XPProgressBar.tsx` — barra animada com brilho.
- `FloatingMicButton.tsx` / `VoiceCallButton.tsx` (refinar) — pulse ring, ondas sonoras, estados demo/live.

Componentes existentes (`MissionCard`, `AppMissionHome`, `AppHero`, etc.) recebem props opcionais para consumir o novo look sem quebrar chamadas.

## Onda 4 — Aplicação nas telas principais

- **`/hub`**: aurora de fundo animada, hero com saudação + ✨, `AICommandBar` refinada com sugestões emoji ("🍳 Resolver jantar", "📱 Criar post", "💰 Posso comprar?", "💪 Treinar agora", "✈️ Planejar viagem"), grid de apps trocado por `AnimatedAppCard` (stagger-in), seções com `SectionHeader`.
- **Home de cada app** (`AppMissionHome`): topo com `DailyMissionCard` colorido pelo app, atalhos com emoji, seções "Ações rápidas / Seu progresso / Modo Prime / Histórico".
- **Landing pública `/app/$slug`**: hero puxa `accent` do app (gradiente e ring), CTAs com glow, cards de plano com borda premium (Prime).
- **`/admin`**: mesma linguagem (chips, borda gradient em stats), sem tocar na lógica.

## Onda 5 — Acabamento

- Skeletons com shimmer premium.
- Toast de conquista com `confetti-pop` sutil.
- Reduced-motion: desliga float-orb, pulse-ai, stagger.
- Mobile: cards com altura confortável, CTAs sempre visíveis, mic não cobre botão principal.

## Escopo negativo (para preservar estabilidade)

- Nenhuma migração de banco.
- Nenhuma mudança de rota, contratos de server functions ou entitlements.
- Nenhum breaking change nos componentes atuais — só adição de props opcionais + novos componentes.
- Não trocar fontes globais (mantém `--font-display` / body atuais).

## Como será entregue

Uma onda por resposta, começando pela Onda 1 assim que você aprovar. Cada onda passa por typecheck antes de fechar.

```text
Onda 1  Tokens + motion (styles.css)
Onda 2  Config por app (config.ts)
Onda 3  Componentes visuais novos
Onda 4  Aplicar em /hub, apps, landing, admin
Onda 5  Polish: skeleton, confetti, reduced-motion
```

Quer que eu comece pela Onda 1?
