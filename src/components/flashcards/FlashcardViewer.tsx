import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flashcard } from '@/types/flashcard';
import { cn } from '@/lib/utils';

interface FlashcardViewerProps {
  cards: Flashcard[];
  onClose: () => void;
}

export const FlashcardViewer = ({ cards, onClose }: FlashcardViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">Nenhum flashcard neste deck.</p>
        <Button variant="outline" onClick={onClose}>
          Voltar
        </Button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const goPrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const restart = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-sm text-muted-foreground">
        {currentIndex + 1} / {cards.length}
      </div>

      <div
        className="perspective-1000 w-full max-w-xl cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: '1000px' }}
      >
        <div
          className={cn(
            'relative w-full transition-transform duration-500',
            'transform-style-preserve-3d',
            isFlipped && 'rotate-y-180'
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <Card
            className={cn(
              'absolute inset-0 w-full min-h-[300px] p-6 flex items-center justify-center',
              'backface-hidden bg-card border-2'
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-lg text-center whitespace-pre-wrap">{currentCard.front}</p>
          </Card>

          {/* Back */}
          <Card
            className={cn(
              'w-full min-h-[300px] p-6 flex items-center justify-center',
              'backface-hidden bg-primary/10 border-2 border-primary/30'
            )}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-lg text-center whitespace-pre-wrap">{currentCard.back}</p>
          </Card>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Clique no card para virar</p>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={goPrev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={restart}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goNext}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Button variant="ghost" onClick={onClose}>
        Fechar estudo
      </Button>
    </div>
  );
};
