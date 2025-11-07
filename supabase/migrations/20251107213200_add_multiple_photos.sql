-- Criar tabela para múltiplas fotos por propriedade
CREATE TABLE IF NOT EXISTS public.property_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de fotos
ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para property_photos
CREATE POLICY "Usuários autenticados podem ver todas as fotos"
  ON public.property_photos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem adicionar fotos às suas propriedades"
  ON public.property_photos FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.properties WHERE id = property_id
    )
  );

CREATE POLICY "Usuários podem deletar fotos de suas propriedades"
  ON public.property_photos FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.properties WHERE id = property_id
    )
  );

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS property_photos_property_id_idx ON public.property_photos(property_id);

-- Adicionar comentários
COMMENT ON TABLE public.property_photos IS 'Tabela para armazenar múltiplas fotos por propriedade';
COMMENT ON COLUMN public.property_photos.property_id IS 'ID da propriedade à qual a foto pertence';
COMMENT ON COLUMN public.property_photos.photo_url IS 'URL da foto no storage';
COMMENT ON COLUMN public.property_photos.photo_name IS 'Nome original do arquivo da foto';
