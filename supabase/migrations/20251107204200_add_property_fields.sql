-- Adicionar novos campos à tabela properties
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS door_number TEXT,
  ADD COLUMN IF NOT EXISTS complement TEXT;

-- Renomear coluna property_number para manter compatibilidade
-- mas vamos usar registration_number como campo principal
COMMENT ON COLUMN public.properties.property_number IS 'Deprecated: Use registration_number instead';
COMMENT ON COLUMN public.properties.registration_number IS 'Matrícula/Nº de Ligação';
COMMENT ON COLUMN public.properties.street IS 'Logradouro';
COMMENT ON COLUMN public.properties.door_number IS 'Número de Porta';
COMMENT ON COLUMN public.properties.complement IS 'Complemento';
COMMENT ON COLUMN public.properties.address IS 'Endereço completo (gerado automaticamente)';
