import { useState, useEffect } from 'react';
import { Plus, Layers, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFlashcards } from '@/hooks/useFlashcards';
import { DeckCard } from '@/components/flashcards/DeckCard';
import { CreateDeckDialog } from '@/components/flashcards/CreateDeckDialog';
import { ImportCSVDialog } from '@/components/flashcards/ImportCSVDialog';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { FlashcardEditor } from '@/components/flashcards/FlashcardEditor';
import { QuickReviewCarousel } from '@/components/flashcards/QuickReviewCarousel';
import { GenerateFlashcardsDialog } from '@/components/ai/GenerateFlashcardsDialog';
import { Flashcard, FlashcardDeck } from '@/types/flashcard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const FlashcardsPage = () => {
  const {
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
    refreshDecks,
  } = useFlashcards();

  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [importDeckId, setImportDeckId] = useState<string | null>(null);
  const [studyingDeck, setStudyingDeck] = useState<FlashcardDeck | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null);
  const [editingCards, setEditingCards] = useState<Flashcard[]>([]);
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [showGenerateAI, setShowGenerateAI] = useState(false);
  const [generateForDeckId, setGenerateForDeckId] = useState<string | null>(null);

  // Fetch card counts for all decks and all cards for quick review
  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      const allCardsArray: Flashcard[] = [];
      for (const deck of decks) {
        const cards = await getFlashcards(deck.id);
        counts[deck.id] = cards.length;
        allCardsArray.push(...cards);
      }
      setCardCounts(counts);
      setAllCards(allCardsArray);
    };
    if (decks.length > 0) {
      fetchCounts();
    }
  }, [decks]);

  const handleCreateDeck = async (
    title: string,
    description: string,
    folderId?: string,
    tagIds?: string[]
  ) => {
    await createDeck(title, description, folderId, tagIds);
  };

  const handleStudy = async (deck: FlashcardDeck) => {
    const cards = await getFlashcards(deck.id);
    setStudyCards(cards);
    setStudyingDeck(deck);
  };

  const handleEdit = async (deck: FlashcardDeck) => {
    const cards = await getFlashcards(deck.id);
    setEditingCards(cards);
    setEditingDeck(deck);
  };

  const handleImport = async (csvContent: string) => {
    if (!importDeckId) return;
    await importFromCSV(importDeckId, csvContent);
    // Refresh card counts
    const cards = await getFlashcards(importDeckId);
    setCardCounts((prev) => ({ ...prev, [importDeckId]: cards.length }));
  };

  const refreshEditingCards = async () => {
    if (!editingDeck) return;
    const cards = await getFlashcards(editingDeck.id);
    setEditingCards(cards);
    setCardCounts((prev) => ({ ...prev, [editingDeck.id]: cards.length }));
  };

  const handleGenerateWithAI = (deckId: string) => {
    setGenerateForDeckId(deckId);
    setShowGenerateAI(true);
  };

  const handleAddGeneratedFlashcards = async (flashcards: { front: string; back: string }[], deckId?: string) => {
    const targetDeckId = deckId || generateForDeckId;
    if (!targetDeckId) return;
    for (const card of flashcards) {
      await addFlashcard(targetDeckId, card.front, card.back);
    }
    await refreshDecks();
    const cards = await getFlashcards(targetDeckId);
    setCardCounts((prev) => ({ ...prev, [targetDeckId]: cards.length }));
    if (editingDeck?.id === targetDeckId) {
      setEditingCards(cards);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  // Study mode
  if (studyingDeck) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Estudando: {studyingDeck.title}
          </h1>
          <FlashcardViewer
            cards={studyCards}
            onClose={() => {
              setStudyingDeck(null);
              setStudyCards([]);
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flashcards</h1>
            <p className="text-muted-foreground mt-1">
              Crie e estude seus flashcards
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setGenerateForDeckId(null); setShowGenerateAI(true); }}>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar com IA
            </Button>
            <Button onClick={() => setShowCreateDeck(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Deck
            </Button>
          </div>
        </div>

        {decks.length === 0 ? (
          <Card className="max-w-lg mx-auto mt-16">
            <CardContent className="pt-8 text-center">
              <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum deck criado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro deck de flashcards
              </p>
              <Button onClick={() => setShowCreateDeck(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Quick Review Section */}
            <div className="bg-muted/30 rounded-lg p-6">
              <QuickReviewCarousel allCards={allCards} />
            </div>

            {/* Decks Grid Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Meus Decks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    cardCount={cardCounts[deck.id] || 0}
                    onStudy={() => handleStudy(deck)}
                    onEdit={() => handleEdit(deck)}
                    onDelete={() => deleteDeck(deck.id)}
                    onImport={() => setImportDeckId(deck.id)}
                    onGenerateAI={() => handleGenerateWithAI(deck.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateDeckDialog
        open={showCreateDeck}
        onOpenChange={setShowCreateDeck}
        onSubmit={handleCreateDeck}
      />

      <GenerateFlashcardsDialog
        open={showGenerateAI}
        onOpenChange={(open) => { setShowGenerateAI(open); if (!open) setGenerateForDeckId(null); }}
        onAddFlashcards={handleAddGeneratedFlashcards}
      />

      <ImportCSVDialog
        open={!!importDeckId}
        onOpenChange={(open) => !open && setImportDeckId(null)}
        onImport={handleImport}
      />

      <Dialog open={!!editingDeck} onOpenChange={(open) => !open && setEditingDeck(null)}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Editar Deck: {editingDeck?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {editingDeck && (
              <FlashcardEditor
                cards={editingCards}
                onAdd={(front, back) => addFlashcard(editingDeck.id, front, back)}
                onUpdate={updateFlashcard}
                onDelete={deleteFlashcard}
                onRefresh={refreshEditingCards}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default FlashcardsPage;
