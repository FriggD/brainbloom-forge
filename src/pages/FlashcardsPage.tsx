import { useState, useEffect } from 'react';
import { Plus, Layers } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useFlashcards } from '@/hooks/useFlashcards';
import { DeckCard } from '@/components/flashcards/DeckCard';
import { CreateDeckDialog } from '@/components/flashcards/CreateDeckDialog';
import { ImportCSVDialog } from '@/components/flashcards/ImportCSVDialog';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { FlashcardEditor } from '@/components/flashcards/FlashcardEditor';
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

  // Fetch card counts for all decks
  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      for (const deck of decks) {
        const cards = await getFlashcards(deck.id);
        counts[deck.id] = cards.length;
      }
      setCardCounts(counts);
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
        <div className="max-w-4xl mx-auto">
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              Flashcards
            </h1>
            <p className="text-muted-foreground mt-1">
              Crie e estude seus flashcards
            </p>
          </div>
          <Button onClick={() => setShowCreateDeck(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Deck
          </Button>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum deck criado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro deck de flashcards
            </p>
            <Button onClick={() => setShowCreateDeck(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Deck
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                cardCount={cardCounts[deck.id] || 0}
                onStudy={() => handleStudy(deck)}
                onEdit={() => handleEdit(deck)}
                onDelete={() => deleteDeck(deck.id)}
                onImport={() => setImportDeckId(deck.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateDeckDialog
        open={showCreateDeck}
        onOpenChange={setShowCreateDeck}
        onSubmit={handleCreateDeck}
      />

      <ImportCSVDialog
        open={!!importDeckId}
        onOpenChange={(open) => !open && setImportDeckId(null)}
        onImport={handleImport}
      />

      <Dialog open={!!editingDeck} onOpenChange={(open) => !open && setEditingDeck(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Deck: {editingDeck?.title}</DialogTitle>
          </DialogHeader>
          {editingDeck && (
            <FlashcardEditor
              cards={editingCards}
              onAdd={(front, back) => addFlashcard(editingDeck.id, front, back)}
              onUpdate={updateFlashcard}
              onDelete={deleteFlashcard}
              onRefresh={refreshEditingCards}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default FlashcardsPage;
