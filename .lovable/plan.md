# Suíte de apps IA — refatoração

Transformar o projeto atual (SaborIA solo) em uma **plataforma de vários apps** onde:
- `/` é uma **landing pública** vendendo a suíte (todos os apps, mesmo preço).
- Após login, o usuário cai num **hub** com switcher entre os apps que contratou + oferta dos que faltam.
- **SaborIA vira o primeiro app**, movido para `/apps/saboria/*`. A arquitetura já fica pronta pra plugar o próximo app no prompt seguinte (basta criar `/apps/<slug>/*` e registrar no catálogo).

## 1. Catálogo de apps (fonte da verdade)

Arquivo `src/apps/registry.ts` com metadata de cada app:
```
{ slug, name, tagline, icon, accent, route, status: 'live'|'soon' }
```
Hoje: `saboria` (live). Próximos: placeholders `soon` até a gente construir.

Usado por: landing, hub, switcher, paywall — nada é hardcoded em vários lugares.

## 2. Estrutura de rotas

```text
/                         Landing pública (vitrine da suíte)
/auth                     Login/signup (já existe)
/_authenticated/
  hub                     Home logada: grid dos apps + switcher
  apps/saboria/           SaborIA (tudo que hoje é /app, /geladeira, /foto, /planner, /nutri, /receitas, /onboarding)
    index                 (antigo /app)
    geladeira
    foto
    planner
    nutri
    receitas
    onboarding
```

Movimentação: renomear os arquivos existentes em `src/routes/_authenticated/*.tsx` para dentro de `src/routes/_authenticated/apps/saboria/`. Atualizar todos os `<Link to>` e `createFileRoute` strings (obrigatório pra bater com o filename — regra do TanStack).

Após login, redirect padrão vai pra `/hub` (não mais `/app`).

## 3. Modelo de dados (entitlements)

**1 conta, várias assinaturas** → tabela `app_entitlements`:

```
app_entitlements(
  user_id uuid → auth.users,
  app_slug text,          -- 'saboria', ...
  status text,            -- 'active' | 'trial' | 'canceled'
  granted_at timestamptz,
  expires_at timestamptz null,
  PK (user_id, app_slug)
)
```

RLS: usuário lê os próprios; só `service_role` escreve (Stripe webhook depois). GRANTs no mesmo migration.

Helper server fn `getMyEntitlements()` (`requireSupabaseAuth`) usado pelo hub e pelo guard de cada app.

**Enquanto Stripe não está ligado**: um trigger no signup concede `saboria` como `trial` automaticamente, pra ninguém ficar travado. Fácil de remover quando o paywall entrar.

## 4. Guard por app

Novo layout `src/routes/_authenticated/apps/saboria/route.tsx` que:
1. Chama `getMyEntitlements()` no loader.
2. Se não tem `saboria` ativo → redireciona pra `/hub?upsell=saboria`.
3. Senão `<Outlet />`.

Padrão replicável pros próximos apps: cada app tem seu `route.tsx` com o mesmo check trocando o slug.

## 5. UI

**Landing (`/`)** — reescrita pra vender a suíte:
- Hero: "Uma assinatura. Vários apps de IA."
- Grid dos apps do registry (SaborIA + placeholders "em breve" com badge).
- Preço único destacado, CTA → `/auth`.
- Mantém o visual mono preto&branco atual.

**Hub (`/hub`)** — nova home logada:
- Saudação + avatar.
- Seção "Meus apps": cards dos apps ativos → clica e entra.
- Seção "Descubra": apps não contratados com CTA "Assinar" (por enquanto desabilitado/coming soon até Stripe).
- Switcher persistente: dropdown no topbar do `AppShell` mostrando os apps do usuário, permite trocar sem voltar ao hub.

**AppShell** — genérico:
- Recebe `appSlug` como prop.
- Bottom nav vira scoped pro app atual (as tabs do SaborIA vêm do registry).
- Botão "Trocar de app" no topo abre o switcher.

## 6. Fora de escopo agora (próximos prompts)

- Stripe / paywall real (o registry e a tabela já ficam prontos pra plugar).
- Construir o 2º app — vem no próximo prompt do usuário. Basta:
  1. Criar `src/routes/_authenticated/apps/<slug>/` com o `route.tsx` guard.
  2. Adicionar no `registry.ts` como `live`.
  3. Aparece automático na landing, hub e switcher.

## Detalhes técnicos

- Migration única: cria `app_entitlements` + RLS + GRANTs + trigger de grant no signup.
- `handle_new_user` existente ganha um `INSERT INTO app_entitlements` pra `saboria` como trial.
- Todos os `<Link to="/app">`, `/geladeira` etc. viram `/apps/saboria/...`. Uso search-replace em massa.
- `_authenticated/app.tsx` atual (dashboard do SaborIA) vira `_authenticated/apps/saboria/index.tsx` sem mudança de conteúdo — só path e imports relativos.
- Registry tipado com `as const` pra ter `slug` union type e navegação type-safe.
