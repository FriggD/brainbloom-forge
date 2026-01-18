import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Flashcard {
  front: string;
  back: string;
}

interface Keyword {
  text: string;
  definition: string;
}

interface UseAIStudyAssistantReturn {
  generateFlashcards: (text: string, count?: number) => Promise<Flashcard[]>;
  summarizeNotes: (text: string) => Promise<string>;
  suggestKeywords: (text: string) => Promise<Keyword[]>;
  isLoading: boolean;
}

export const useAIStudyAssistant = (): UseAIStudyAssistantReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const callAI = async (action: string, text: string, count?: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-study-assistant', {
        body: { action, text, count }
      });

      if (error) {
        console.error('AI function error:', error);
        toast.error('Erro ao processar com IA');
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const generateFlashcards = async (text: string, count = 5): Promise<Flashcard[]> => {
    const result = await callAI('generate-flashcards', text, count);
    return result.flashcards || [];
  };

  const summarizeNotes = async (text: string): Promise<string> => {
    const result = await callAI('summarize-notes', text);
    return result.summary || '';
  };

  const suggestKeywords = async (text: string): Promise<Keyword[]> => {
    const result = await callAI('suggest-keywords', text);
    return result.keywords || [];
  };

  return {
    generateFlashcards,
    summarizeNotes,
    suggestKeywords,
    isLoading,
  };
};
