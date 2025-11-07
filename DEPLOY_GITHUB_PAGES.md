# 🚀 Deploy no GitHub Pages - Passo a Passo

## ✅ Configuração Concluída

O projeto já está configurado para deploy no GitHub Pages:
- ✅ `gh-pages` instalado
- ✅ Scripts de deploy adicionados
- ✅ `vite.config.ts` configurado
- ✅ URL base definida

---

## 📋 Passos para Deploy

### 1. Commit e Push das Alterações

```bash
git add .
git commit -m "Configurar para GitHub Pages"
git push origin main
```

### 2. Fazer o Deploy

```bash
npm run deploy
```

**O que acontece:**
1. O comando `predeploy` executa automaticamente (`npm run build`)
2. Cria a pasta `dist` com os arquivos otimizados
3. O comando `deploy` publica a pasta `dist` no branch `gh-pages`
4. Aguarde 1-2 minutos

### 3. Ativar GitHub Pages no Repositório

1. Acesse: https://github.com/elfabitto/geo-collect-app
2. Vá em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em **Source**, selecione:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Clique em **Save**

### 4. Aguardar Deploy

- O GitHub levará 2-5 minutos para publicar
- Você verá uma mensagem: "Your site is live at..."

---

## 🌐 URL do Seu Site

Após o deploy, seu site estará disponível em:

**https://elfabitto.github.io/geo-collect-app**

---

## 🔄 Atualizações Futuras

Sempre que quiser atualizar o site:

```bash
# 1. Faça suas alterações no código
# 2. Commit
git add .
git commit -m "Descrição das alterações"
git push origin main

# 3. Deploy
npm run deploy
```

**Pronto!** Em 2-3 minutos as alterações estarão no ar.

---

## ⚠️ IMPORTANTE: Variáveis de Ambiente

O arquivo `.env` **NÃO** é enviado para o GitHub (está no `.gitignore`).

**Você tem 2 opções:**

### Opção 1: Hardcode (Não recomendado para produção)

Edite `src/integrations/supabase/client.ts`:

```typescript
const supabaseUrl = "https://seu-project-id.supabase.co";
const supabaseKey = "sua-anon-key-aqui";
```

### Opção 2: GitHub Secrets + GitHub Actions (Recomendado)

Crie um workflow para build com secrets. Mas isso é mais complexo.

**Para teste rápido, use a Opção 1.**

---

## 🧪 Testar Localmente Antes do Deploy

```bash
# Build de produção
npm run build

# Testar o build
npm run preview
```

Acesse: http://localhost:4173

---

## 🐛 Troubleshooting

### Erro 404 ao acessar o site
- Verifique se o branch `gh-pages` foi criado
- Confirme que GitHub Pages está ativado nas configurações
- Aguarde alguns minutos

### Página em branco
- Verifique se o `base` no `vite.config.ts` está correto: `/geo-collect-app/`
- Verifique se as variáveis do Supabase estão configuradas

### Erro ao fazer deploy
```bash
# Limpe o cache e tente novamente
rm -rf dist
rm -rf node_modules/.cache
npm run deploy
```

---

## 📱 Domínio Customizado (Opcional)

Se quiser usar seu próprio domínio:

1. No repositório GitHub, vá em **Settings** → **Pages**
2. Em **Custom domain**, digite: `seudominio.com.br`
3. Configure DNS do seu domínio:
   ```
   Type: CNAME
   Name: www
   Value: elfabitto.github.io
   ```

---

## ✨ Pronto!

Seu sistema de coleta está no ar! 🎉

**URL:** https://elfabitto.github.io/geo-collect-app

Compartilhe com sua equipe e comece a coletar dados!
