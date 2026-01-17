import { useState, useEffect } from 'react';
import { Shuffle, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/types/flashcard';
import { cn } from '@/lib/utils';

interface QuickReviewCarouselProps {
  allCards: Flashcard[];
  onStartFullStudy?: (deckId: string) => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const QuickReviewCarousel = ({ allCards }: QuickReviewCarouselProps) => {
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (allCards.length > 0) {
      setShuffledCards(shuffleArray(allCards).slice(0, 10));
    }
  }, [allCards]);

  useEffect(() => {
    if (!autoPlay || shuffledCards.length === 0) return;
    
    const interval = setInterval(() => {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % shuffledCards.length);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPlay, shuffledCards.length]);

  const handleShuffle = () => {
    setShuffledCards(shuffleArray(allCards).slice(0, 10));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (shuffledCards.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Adicione flashcards aos seus decks para começar a revisão rápida
        </p>
      </Card>
    );
  }

  const currentCard = shuffledCards[currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Revisão Rápida</h2>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} de {shuffledCards.length} cards aleatórios
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoPlay(!autoPlay)}
          >
            <Play className={cn("w-4 h-4 mr-2", autoPlay && "text-primary")} />
            {autoPlay ? 'Pausar' : 'Auto'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShuffle}>
            <Shuffle className="w-4 h-4 mr-2" />
            Embaralhar
          </Button>
        </div>
      </div>

      <div
        className="perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <Card
            className="absolute inset-0 w-full min-h-[200px] p-6 flex items-center justify-center backface-hidden bg-card border-2"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-lg text-center whitespace-pre-wrap">
              {currentCard.front}
            </p>
          </Card>

          {/* Back */}
          <Card
            className="w-full min-h-[200px] p-6 flex items-center justify-center backface-hidden bg-primary/10 border-2 border-primary/30"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-lg text-center whitespace-pre-wrap">
              {currentCard.back}
            </p>
          </Card>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Clique no card para virar • Auto-play muda a cada 4 segundos
      </p>
    </div>
  );
};
