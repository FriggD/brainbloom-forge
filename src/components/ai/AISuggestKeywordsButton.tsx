import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAIStudyAssistant } from '@/hooks/useAIStudyAssistant';
import { toast } from 'sonner';
import { Keyword } from '@/types/study';

interface AISuggestKeywordsButtonProps {
  text: string;
  onKeywordsGenerated: (keywords: Keyword[]) => void;
  disabled?: boolean;
}

export const AISuggestKeywordsButton = ({
  text,
  onKeywordsGenerated,
  disabled,
}: AISuggestKeywordsButtonProps) => {
  const { suggestKeywords, isLoading } = useAIStudyAssistant();

  const handleSuggestKeywords = async () => {
    if (!text.trim()) {
      toast.error('Adicione anotações antes de sugerir palavras-chave');
      return;
    }

    try {
      const keywords = await suggestKeywords(text);
      const formattedKeywords: Keyword[] = keywords.map(kw => ({
        id: crypto.randomUUID(),
        text: kw.text,
        definition: kw.definition,
      }));
      onKeywordsGenerated(formattedKeywords);
      toast.success(`${keywords.length} palavras-chave sugeridas!`);
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSuggestKeywords}
            disabled={disabled || isLoading || !text.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="ml-2">Sugerir com IA</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sugerir palavras-chave automaticamente</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
