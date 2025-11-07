# Guia: Configurar Novo Projeto Supabase

## Passo 1: Criar Novo Projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Preencha:
   - **Name**: geo-collect-app (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte e ANOTE
   - **Region**: Escolha a região mais próxima (South America - São Paulo)
4. Clique em "Create new project"
5. Aguarde alguns minutos até o projeto ser criado

## Passo 2: Obter Credenciais do Projeto

Após o projeto ser criado:

1. No painel do projeto, vá em **Settings** (ícone de engrenagem) → **API**
2. Anote as seguintes informações:

```
Project URL: https://[SEU-PROJECT-ID].supabase.co
anon/public key: eyJhbGc... (uma chave longa)
```

## Passo 3: Executar SQL para Criar Tabelas

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados)
2. Clique em "New Query"
3. Cole o conteúdo do arquivo `supabase/migrations/20251107134254_e8a5f0f3-48dc-4454-8826-578a4a1670ef.sql`
4. Clique em "Run" (ou pressione Ctrl+Enter)
5. Aguarde a mensagem de sucesso

## Passo 4: Executar SQL para Adicionar Novos Campos

1. Ainda no **SQL Editor**, clique em "New Query" novamente
2. Cole o conteúdo do arquivo `supabase/migrations/20251107204200_add_property_fields.sql`
3. Clique em "Run"
4. Aguarde a mensagem de sucesso

## Passo 5: Atualizar Arquivo .env

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua as credenciais antigas pelas novas:

```env
VITE_SUPABASE_PROJECT_ID="[SEU-NOVO-PROJECT-ID]"
VITE_SUPABASE_PUBLISHABLE_KEY="[SUA-NOVA-ANON-KEY]"
VITE_SUPABASE_URL="https://[SEU-NOVO-PROJECT-ID].supabase.co"
```

## Passo 6: Reiniciar o Servidor

1. No terminal onde o servidor está rodando, pressione `Ctrl+C` para parar
2. Execute novamente: `npm run dev`
3. Acesse http://localhost:8080

## Passo 7: Criar Primeiro Usuário

1. Na aplicação, clique em "Criar conta" ou vá para `/auth`
2. Cadastre-se com email e senha
3. Verifique seu email (se necessário)
4. Faça login

## Pronto! 🎉

Agora você pode:
- ✅ Criar pontos no mapa
- ✅ Adicionar todos os campos (Matrícula, Hidrômetro, Logradouro, etc.)
- ✅ Fazer upload de fotos
- ✅ Buscar e filtrar pontos
- ✅ Editar e excluir pontos

---

## Troubleshooting

### Erro de autenticação
- Verifique se as credenciais no `.env` estão corretas
- Reinicie o servidor após alterar o `.env`

### Erro ao salvar pontos
- Verifique se executou AMBOS os scripts SQL
- Verifique se o bucket de storage foi criado

### Fotos não aparecem
- Vá em **Storage** no Supabase
- Verifique se o bucket `property-photos` existe
- Verifique se está marcado como "Public"
