# Fix imediato + Redesign NXA em Ondas

## Fix aplicado agora (não precisa aprovação)
`src/lib/ai-shared.ts`: para modelos gpt-5/o1/o3/gpt-4.1 dobramos o budget de tokens (min 4000) porque reasoning tokens consomem parte, e removemos `response_format: json_object` (não suportado por gpt-5 reasoning). Isso mata o 400 e as respostas vazias do Chef, Grana, etc.

Se ainda faltar teto, subo para 6000/8000 por chamada específica.

---

## Redesign — 6 ondas

Escopo enorme (10 apps, dashboard, landings, gates, novas features). Divido para caber em revisões. Cada onda é independente e testável.

### Onda A — Configuração central + copy comercial
- `src/apps/config.ts`: registro único por app com `pain`, `heroCTA`, `missions`, `shortcuts`, `baseFeatures`, `primeFeatures`, `primeAutopilot`, `mediaExports`, `memoryFacts`, `emptyStates`, `notifications`, `bottomNav[]`, tema.
- Migra `registry.ts` + `pricing.ts` + `landings.ts` para consumir esse config (backwards compatible).
- Substitui todas as strings técnicas ("A IA retornou resposta inválida", "0 sessões", etc.) por copy amigável centralizada em `src/lib/copy.ts`.

### Onda B — Design system refinado
- `src/styles.css`: refino dos 3 temas (Light premium, Paper editorial, Dark profundo — sem preto puro), tokens `--surface-*`, `--ring-prime`, sombras longas, mais respiro.
- Tipografia: display serif (Instrument Serif / Fraunces) + Inter body.
- Novos primitivos: `AppHero`, `DailyMissionCard`, `AICommandBar`, `SmartShortcutCard`, `AppStats`, `EmptyState`, `NotificationCard`, `MemoryPanel`, `MediaExportPanel`, `BottomNav` contextual.
- Remove overlays escuros pesados dos tiles.

### Onda C — Dashboard = centro de comando
Refaz `src/routes/_authenticated/hub.tsx`:
1. Saudação + status trial/assinatura.
2. Hero "O que você quer resolver agora?" + `AICommandBar` global com 5 sugestões rotativas.
3. **Próxima melhor ação** (agrega streaks/lembretes/agente).
4. **Seus apps ativos** — cards orientados por dor + indicador de valor real ("3 sugestões hoje").
5. **Descubra outros apps** — cards com "Começar teste grátis".
6. **Sua jornada** — XP/streak/badges compacto.
7. Cluster header: mic global, sino, memória, afiliados.

### Onda D — Tela inicial padrão dos 10 apps
Reescreve cada `apps/<slug>/index.tsx` no template:
- Header com selo Prime + botão "Ligar com IA".
- `AppHero` (missão do dia + CTA principal específico do app).
- `AICommandBar` contextual ("Me ajuda agora").
- `SmartShortcutCard`s por missão (não por função).
- `AppStats` com estados vazios amigáveis (nunca "0 X").
- Bloco `PrimeUpsellCard` contextual.
- `BottomNav` com item central específico (Cozinhar / Criar / Cuidar / etc.).

Aplico em ordem: Chef → Social → Grana → Fit → Pet → Style → Glow → Língua → Cosmos → Travel.

### Onda E — Prime gating + Autopilot + Mídia + Memória
- Amplia `PrimeGate` já criado para cobrir todos os recursos Prime listados no briefing por app (não só as 6 rotas atuais).
- `PrimeUpsellModal` refinado com 3–5 benefícios específicos do app.
- `LockedFeatureCard` com blur/lock elegante.
- Painel "Memória deste app" visível em cada app (lê `user_memories` filtrado por slug).
- Aba Mídia por app usando `mediaExports` do config, com PDF/PPTX/TTS gated como Prime.
- Stubs de Autopilot Prime (agenda cron simbólica por app) — só UI + botão "Ativar autopilot".

### Onda F — Landings individuais + checkout
Reescreve `src/routes/assinar.$slug.tsx` como landing editorial completa por app:
- Hero orientado por dor + CTA "Começar teste grátis" / "Ver Prime".
- Bloco "O que você resolve".
- `PricingCard` Base + Prime lado a lado.
- `FeatureComparison` Base vs Prime.
- Exemplos visuais / mockups do app.
- FAQ (3–4 por app via template).
- CTA fixo no rodapé mobile.
- Fluxo: trial base → `UpsellModal` Prime → app.

---

## Fora de escopo
- Pagamento real (Stripe/Paddle): trial 7d continua.
- Novas features de IA que exigem infra pesada (análise de vídeo Fit, sinastria astral profunda) — entram como stubs marcados Prime.
- Não mexo em `client.ts`/`types.ts`/auth auto-gerados.

## Como quer que eu prossiga?
Responde:
- **"A+B"** — fundação (config + design system), 1 revisão visual antes de continuar.
- **"A→C"** — fundação + dashboard novo.
- **"tudo em sequência"** — vou fazendo A, B, C, D, E, F sem parar entre elas.
- **"só D pra <app>"** — foco em 1 app específico primeiro para você validar o padrão.
