-- ============================================
-- INSTRUÇÕES PARA APLICAR AS MUDANÇAS NO BANCO
-- ============================================
-- 
-- 1. Acesse o painel do Supabase: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Vá em "SQL Editor" no menu lateral
-- 4. Cole este script completo
-- 5. Clique em "Run" para executar
--
-- ============================================

-- Adicionar novos campos à tabela properties
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS door_number TEXT,
  ADD COLUMN IF NOT EXISTS complement TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.properties.property_number IS 'Deprecated: Use registration_number instead';
COMMENT ON COLUMN public.properties.registration_number IS 'Matrícula/Nº de Ligação';
COMMENT ON COLUMN public.properties.street IS 'Logradouro';
COMMENT ON COLUMN public.properties.door_number IS 'Número de Porta';
COMMENT ON COLUMN public.properties.complement IS 'Complemento';
COMMENT ON COLUMN public.properties.address IS 'Endereço completo (gerado automaticamente)';

-- Migrar dados existentes (copiar property_number para registration_number)
UPDATE public.properties 
SET registration_number = property_number 
WHERE registration_number IS NULL;

-- Verificar se as colunas foram criadas com sucesso
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'properties'
  AND column_name IN ('registration_number', 'street', 'door_number', 'complement')
ORDER BY column_name;
