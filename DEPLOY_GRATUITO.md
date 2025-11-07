# Guia: Deploy Gratuito do Projeto

## Opções de Deploy Gratuito

### 🚀 Opção 1: Vercel (RECOMENDADO)

**Vantagens:**
- ✅ Totalmente gratuito
- ✅ Deploy automático a cada commit
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Muito rápido

**Passos:**

1. **Criar conta no Vercel**
   - Acesse: https://vercel.com
   - Faça login com sua conta GitHub

2. **Fazer push do projeto para GitHub**
   ```bash
   git add .
   git commit -m "Projeto pronto para deploy"
   git push origin main
   ```

3. **Importar projeto no Vercel**
   - No painel do Vercel, clique em "Add New" → "Project"
   - Selecione o repositório `geo-collect-app`
   - Clique em "Import"

4. **Configurar variáveis de ambiente**
   - Em "Environment Variables", adicione:
   ```
   VITE_SUPABASE_PROJECT_ID=seu-project-id
   VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
   VITE_SUPABASE_URL=https://seu-project-id.supabase.co
   ```

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Seu site estará no ar! 🎉

**URL final:** `https://geo-collect-app.vercel.app` (ou similar)

---

### 🌐 Opção 2: Netlify

**Vantagens:**
- ✅ Gratuito
- ✅ Fácil de usar
- ✅ HTTPS automático

**Passos:**

1. **Criar conta no Netlify**
   - Acesse: https://netlify.com
   - Faça login com GitHub

2. **Fazer push para GitHub** (se ainda não fez)
   ```bash
   git add .
   git commit -m "Deploy"
   git push origin main
   ```

3. **Importar projeto**
   - Clique em "Add new site" → "Import an existing project"
   - Conecte com GitHub
   - Selecione o repositório

4. **Configurar build**
   - Build command: `npm run build`
   - Publish directory: `dist`

5. **Adicionar variáveis de ambiente**
   - Vá em "Site settings" → "Environment variables"
   - Adicione as mesmas variáveis do Vercel

6. **Deploy**
   - Clique em "Deploy site"

---

### 📦 Opção 3: GitHub Pages

**Vantagens:**
- ✅ Totalmente gratuito
- ✅ Integrado com GitHub

**Passos:**

1. **Instalar gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Adicionar scripts no package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://seu-usuario.github.io/geo-collect-app"
   }
   ```

3. **Configurar vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/geo-collect-app/',
     // ... resto da config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

**URL:** `https://seu-usuario.github.io/geo-collect-app`

---

### ☁️ Opção 4: Render

**Vantagens:**
- ✅ Gratuito
- ✅ Simples

**Passos:**

1. Acesse: https://render.com
2. Crie conta
3. "New" → "Static Site"
4. Conecte GitHub
5. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
6. Adicione variáveis de ambiente
7. Deploy

---

## ⚙️ Configuração Importante

### Variáveis de Ambiente

Para QUALQUER opção de deploy, você precisa configurar:

```env
VITE_SUPABASE_PROJECT_ID=seu-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
```

**Onde encontrar:**
- Painel do Supabase → Settings → API

---

## 🎯 Recomendação Final

**Use Vercel** porque:
1. Mais rápido
2. Melhor integração com Vite
3. Deploy automático
4. Sem configuração complexa
5. CDN global gratuito

---

## 📱 Após o Deploy

1. **Teste o site**
   - Acesse a URL fornecida
   - Faça login
   - Crie um ponto de teste

2. **Configure domínio customizado** (opcional)
   - Vercel/Netlify permitem domínio próprio gratuito
   - Ex: `coleta.seudominio.com.br`

3. **Atualizações automáticas**
   - Cada `git push` faz deploy automático
   - Sem necessidade de fazer nada manual

---

## 🔒 Segurança

- ✅ HTTPS automático em todas as opções
- ✅ Variáveis de ambiente protegidas
- ✅ Supabase RLS ativo
- ✅ Autenticação obrigatória

---

## 💰 Custos

**TUDO GRATUITO:**
- ✅ Vercel: Gratuito para sempre
- ✅ Netlify: Gratuito para sempre
- ✅ GitHub Pages: Gratuito para sempre
- ✅ Render: Gratuito (com limitações)
- ✅ Supabase: Gratuito até 500MB de banco

**Sem cartão de crédito necessário!**
