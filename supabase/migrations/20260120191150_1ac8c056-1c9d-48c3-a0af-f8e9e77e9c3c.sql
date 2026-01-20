-- Criar tabela de glossário
CREATE TABLE public.glossary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own glossary terms" 
ON public.glossary 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own glossary terms" 
ON public.glossary 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own glossary terms" 
ON public.glossary 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own glossary terms" 
ON public.glossary 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_glossary_updated_at
BEFORE UPDATE ON public.glossary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para busca rápida
CREATE INDEX idx_glossary_term ON public.glossary USING gin(to_tsvector('portuguese', term));
CREATE INDEX idx_glossary_user ON public.glossary(user_id);