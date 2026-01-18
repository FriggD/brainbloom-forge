import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flashcard } from '@/types/flashcard';
import { cn } from '@/lib/utils';

interface FlashcardViewerProps {
  cards: Flashcard[];
  onClose: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const FlashcardViewer = ({ cards, onClose }: FlashcardViewerProps) => {
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    setShuffledCards(shuffleArray(cards));
  }, [cards]);

  if (shuffledCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">Nenhum flashcard neste deck.</p>
        <Button variant="outline" onClick={onClose}>
          Voltar
        </Button>
      </div>
    );
  }

  const currentCard = shuffledCards[currentIndex];

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledCards.length);
  };

  const goPrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length);
  };

  const restart = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
    setShuffledCards(shuffleArray(cards));
  };

  return (
    <div className={cn(
      "flex flex-col items-center gap-6 transition-all",
      focusMode ? "p-0 min-h-screen justify-center" : "p-4 md:p-8"
    )}>
      {!focusMode && (
        <div className="flex items-center gap-4 w-full max-w-xl justify-between">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {shuffledCards.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFocusMode(!focusMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Modo Foco
          </Button>
        </div>
      )}

      <div
        className={cn(
          "perspective-1000 cursor-pointer transition-all",
          focusMode ? "w-full max-w-4xl" : "w-full max-w-xl"
        )}
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
              'absolute inset-0 w-full p-8 md:p-12 flex items-center justify-center',
              'backface-hidden bg-card border-2',
              focusMode ? 'min-h-[400px] md:min-h-[500px]' : 'min-h-[300px]'
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className={cn(
              "text-center whitespace-pre-wrap",
              focusMode ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
            )}>{currentCard.front}</p>
          </Card>

          {/* Back */}
          <Card
            className={cn(
              'w-full p-8 md:p-12 flex items-center justify-center',
              'backface-hidden bg-primary/10 border-2 border-primary/30',
              focusMode ? 'min-h-[400px] md:min-h-[500px]' : 'min-h-[300px]'
            )}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className={cn(
              "text-center whitespace-pre-wrap",
              focusMode ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
            )}>{currentCard.back}</p>
          </Card>
        </div>
      </div>

      {!focusMode && <p className="text-sm text-muted-foreground">Clique no card para virar</p>}

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

      {focusMode ? (
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setFocusMode(false)}>
            <EyeOff className="w-4 h-4 mr-2" />
            Sair do Foco
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Fechar estudo
          </Button>
        </div>
      ) : (
        <Button variant="ghost" onClick={onClose}>
          Fechar estudo
        </Button>
      )}
    </div>
  );
};
