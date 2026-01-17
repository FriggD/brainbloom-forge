-- Create flashcard_decks table
CREATE TABLE public.flashcard_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcards table
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcard_deck_tags junction table
CREATE TABLE public.flashcard_deck_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(deck_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_deck_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for flashcard_decks
CREATE POLICY "Users can view their own decks" ON public.flashcard_decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks" ON public.flashcard_decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" ON public.flashcard_decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" ON public.flashcard_decks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for flashcards (via deck ownership)
CREATE POLICY "Users can view flashcards in their decks" ON public.flashcards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create flashcards in their decks" ON public.flashcards
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update flashcards in their decks" ON public.flashcards
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete flashcards in their decks" ON public.flashcards
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
  );

-- RLS policies for flashcard_deck_tags
CREATE POLICY "Users can manage their deck tags" ON public.flashcard_deck_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
  );

-- Triggers for updated_at
CREATE TRIGGER update_flashcard_decks_updated_at
  BEFORE UPDATE ON public.flashcard_decks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();