import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FlashcardDeck, Flashcard } from '@/types/flashcard';
import { Tag } from '@/types/study';
import { toast } from 'sonner';

export const useFlashcards = () => {
  const { user } = useAuth();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDecks = useCallback(async () => {
    if (!user) {
      setDecks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: decksData, error: decksError } = await supabase
        .from('flashcard_decks')
        .select('*')
        .order('created_at', { ascending: false });

      if (decksError) throw decksError;

      // Fetch tags for each deck
      const { data: deckTagsData } = await supabase
        .from('flashcard_deck_tags')
        .select('deck_id, tag_id, tags(*)');

      const { data: tagsData } = await supabase.from('tags').select('*');

      const tagsMap = new Map<string, Tag>();
      tagsData?.forEach((t) => {
        tagsMap.set(t.id, { id: t.id, name: t.name, color: t.color });
      });

      const deckTagsMap = new Map<string, Tag[]>();
      deckTagsData?.forEach((dt: any) => {
        const existing = deckTagsMap.get(dt.deck_id) || [];
        if (dt.tags) {
          existing.push({ id: dt.tags.id, name: dt.tags.name, color: dt.tags.color });
        }
        deckTagsMap.set(dt.deck_id, existing);
      });

      setDecks(
        decksData?.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description || '',
          folderId: d.folder_id || undefined,
          tags: deckTagsMap.get(d.id) || [],
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('Erro ao carregar decks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const createDeck = async (
    title: string,
    description: string,
    folderId?: string,
    tagIds?: string[]
  ): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('flashcard_decks')
      .insert({
        title,
        description,
        folder_id: folderId || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar deck');
      console.error(error);
      return null;
    }

    // Add tags
    if (tagIds && tagIds.length > 0 && data) {
      const tagInserts = tagIds.map((tagId) => ({
        deck_id: data.id,
        tag_id: tagId,
      }));
      await supabase.from('flashcard_deck_tags').insert(tagInserts);
    }

    await fetchDecks();
    toast.success('Deck criado!');
    return data?.id || null;
  };

  const updateDeck = async (
    deckId: string,
    title: string,
    description: string,
    folderId?: string,
    tagIds?: string[]
  ) => {
    const { error } = await supabase
      .from('flashcard_decks')
      .update({
        title,
        description,
        folder_id: folderId || null,
      })
      .eq('id', deckId);

    if (error) {
      toast.error('Erro ao atualizar deck');
      console.error(error);
      return;
    }

    // Update tags
    if (tagIds !== undefined) {
      await supabase.from('flashcard_deck_tags').delete().eq('deck_id', deckId);
      if (tagIds.length > 0) {
        const tagInserts = tagIds.map((tagId) => ({
          deck_id: deckId,
          tag_id: tagId,
        }));
        await supabase.from('flashcard_deck_tags').insert(tagInserts);
      }
    }

    await fetchDecks();
    toast.success('Deck atualizado!');
  };

  const deleteDeck = async (deckId: string) => {
    const { error } = await supabase.from('flashcard_decks').delete().eq('id', deckId);

    if (error) {
      toast.error('Erro ao deletar deck');
      console.error(error);
      return;
    }

    await fetchDecks();
    toast.success('Deck deletado!');
  };

  const getFlashcards = async (deckId: string): Promise<Flashcard[]> => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      return [];
    }

    return (
      data?.map((f) => ({
        id: f.id,
        deckId: f.deck_id,
        front: f.front,
        back: f.back,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      })) || []
    );
  };

  const addFlashcard = async (deckId: string, front: string, back: string) => {
    const { error } = await supabase.from('flashcards').insert({
      deck_id: deckId,
      front,
      back,
    });

    if (error) {
      toast.error('Erro ao adicionar flashcard');
      console.error(error);
      return false;
    }

    return true;
  };

  const updateFlashcard = async (cardId: string, front: string, back: string) => {
    const { error } = await supabase
      .from('flashcards')
      .update({ front, back })
      .eq('id', cardId);

    if (error) {
      toast.error('Erro ao atualizar flashcard');
      console.error(error);
      return false;
    }

    return true;
  };

  const deleteFlashcard = async (cardId: string) => {
    const { error } = await supabase.from('flashcards').delete().eq('id', cardId);

    if (error) {
      toast.error('Erro ao deletar flashcard');
      console.error(error);
      return false;
    }

    return true;
  };

  const importFromCSV = async (deckId: string, csvContent: string): Promise<number> => {
    const lines = csvContent.split('\n').filter((line) => line.trim());
    let imported = 0;

    for (const line of lines) {
      // Handle CSV with quoted fields
      const matches = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g);
      if (matches && matches.length >= 2) {
        let front = matches[0].replace(/^,/, '').trim();
        let back = matches[1].replace(/^,/, '').trim();

        // Remove quotes and unescape double quotes
        if (front.startsWith('"') && front.endsWith('"')) {
          front = front.slice(1, -1).replace(/""/g, '"');
        }
        if (back.startsWith('"') && back.endsWith('"')) {
          back = back.slice(1, -1).replace(/""/g, '"');
        }

        if (front && back) {
          const success = await addFlashcard(deckId, front, back);
          if (success) imported++;
        }
      }
    }

    if (imported > 0) {
      toast.success(`${imported} flashcards importados!`);
    }

    return imported;
  };

  return {
    decks,
    loading,
    createDeck,
    updateDeck,
    deleteDeck,
    getFlashcards,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    importFromCSV,
    refreshDecks: fetchDecks,
  };
};
