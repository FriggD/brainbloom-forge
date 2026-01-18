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

interface AISummarizeButtonProps {
  text: string;
  onSummaryGenerated: (summary: string) => void;
  disabled?: boolean;
}

export const AISummarizeButton = ({
  text,
  onSummaryGenerated,
  disabled,
}: AISummarizeButtonProps) => {
  const { summarizeNotes, isLoading } = useAIStudyAssistant();

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error('Adicione anotações antes de resumir');
      return;
    }

    try {
      const summary = await summarizeNotes(text);
      onSummaryGenerated(summary);
      toast.success('Resumo gerado com sucesso!');
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
            onClick={handleSummarize}
            disabled={disabled || isLoading || !text.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="ml-2">Resumir com IA</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Gerar resumo automático das anotações</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
