import { useState } from 'react';
import { Sparkles, Loader2, Plus, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAIStudyAssistant } from '@/hooks/useAIStudyAssistant';
import { toast } from 'sonner';

interface GeneratedFlashcard {
  front: string;
  back: string;
  selected: boolean;
}

interface GenerateFlashcardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFlashcards: (flashcards: { front: string; back: string }[]) => Promise<void>;
}

export const GenerateFlashcardsDialog = ({
  open,
  onOpenChange,
  onAddFlashcards,
}: GenerateFlashcardsDialogProps) => {
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { generateFlashcards, isLoading } = useAIStudyAssistant();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Digite um texto para gerar flashcards');
      return;
    }

    try {
      const flashcards = await generateFlashcards(text, count);
      setGeneratedCards(flashcards.map(fc => ({ ...fc, selected: true })));
      toast.success(`${flashcards.length} flashcards gerados!`);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const toggleCard = (index: number) => {
    setGeneratedCards(prev =>
      prev.map((card, i) => (i === index ? { ...card, selected: !card.selected } : card))
    );
  };

  const handleAddSelected = async () => {
    const selectedCards = generatedCards.filter(c => c.selected);
    if (selectedCards.length === 0) {
      toast.error('Selecione pelo menos um flashcard');
      return;
    }

    setIsAdding(true);
    try {
      await onAddFlashcards(selectedCards.map(({ front, back }) => ({ front, back })));
      toast.success(`${selectedCards.length} flashcards adicionados!`);
      handleClose();
    } catch (error) {
      toast.error('Erro ao adicionar flashcards');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setText('');
    setCount(5);
    setGeneratedCards([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerar Flashcards com IA
          </DialogTitle>
          <DialogDescription>
            Cole um texto e a IA irá gerar flashcards automaticamente
          </DialogDescription>
        </DialogHeader>

        {generatedCards.length === 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Texto para análise</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cole aqui o texto do qual deseja gerar flashcards..."
                className="min-h-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantidade de flashcards</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 5)))}
                className="w-24"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {generatedCards.filter(c => c.selected).length} de {generatedCards.length} selecionados
              </p>
              <Button variant="ghost" size="sm" onClick={() => setGeneratedCards([])}>
                Gerar novos
              </Button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {generatedCards.map((card, index) => (
                <Card
                  key={index}
                  className={`p-4 cursor-pointer transition-all ${
                    card.selected ? 'border-primary bg-primary/5' : 'opacity-60'
                  }`}
                  onClick={() => toggleCard(index)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={card.selected} className="mt-1" />
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          Frente
                        </span>
                        <p className="text-sm">{card.front}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          Verso
                        </span>
                        <p className="text-sm text-muted-foreground">{card.back}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {generatedCards.length === 0 ? (
            <Button onClick={handleGenerate} disabled={isLoading || !text.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Flashcards
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleAddSelected} disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Selecionados
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
