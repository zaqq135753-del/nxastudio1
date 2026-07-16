# Deploy na Vercel

O projeto está configurado com preset `vercel` do Nitro. Passo a passo:

## 1. Push do código para o Git
```bash
git init
git add .
git commit -m "init"
git remote add origin <SEU_REPO>
git push -u origin main
```

## 2. Importar na Vercel
- Acesse https://vercel.com/new
- Importe o repositório
- Framework Preset: **Other** (o `vercel.json` cuida do resto)
- Build Command: `npm run build` (auto)
- Output Directory: `.vercel/output` (auto via `vercel.json`)

## 3. Environment Variables (obrigatório)
Cadastre em **Project Settings → Environment Variables** (Production + Preview):

**Public (frontend):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

**Server (backend / server functions):**
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(pegue no dashboard do Supabase)*
- `OPENAI_API_KEY`
- `LOVABLE_API_KEY` *(opcional, fallback do gateway)*
- `ELEVENLABS_API_KEY` *(opcional, voz realtime)*
- `INFINITEPAY_WEBHOOK_SECRET` *(opcional, valida webhook)*

## 4. Deploy
Clique em **Deploy**. Após o primeiro deploy, atualize no InfinitePay o webhook para:
```
https://SEU_DOMINIO.vercel.app/api/public/infinitepay-webhook
```

## 5. Supabase Auth
Adicione o domínio da Vercel em **Supabase → Auth → URL Configuration → Redirect URLs**:
```
https://SEU_DOMINIO.vercel.app/**
```
