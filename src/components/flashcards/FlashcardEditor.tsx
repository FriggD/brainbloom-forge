import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Flashcard } from '@/types/flashcard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FlashcardEditorProps {
  cards: Flashcard[];
  onAdd: (front: string, back: string) => Promise<boolean>;
  onUpdate: (cardId: string, front: string, back: string) => Promise<boolean>;
  onDelete: (cardId: string) => Promise<boolean>;
  onRefresh: () => void;
}

export const FlashcardEditor = ({
  cards,
  onAdd,
  onUpdate,
  onDelete,
  onRefresh,
}: FlashcardEditorProps) => {
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  const handleAdd = async () => {
    if (!newFront.trim() || !newBack.trim()) return;
    const success = await onAdd(newFront.trim(), newBack.trim());
    if (success) {
      setNewFront('');
      setNewBack('');
      onRefresh();
    }
  };

  const startEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFront('');
    setEditBack('');
  };

  const saveEdit = async () => {
    if (!editingId || !editFront.trim() || !editBack.trim()) return;
    const success = await onUpdate(editingId, editFront.trim(), editBack.trim());
    if (success) {
      cancelEdit();
      onRefresh();
    }
  };

  const handleDelete = async (cardId: string) => {
    const success = await onDelete(cardId);
    if (success) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add new card form */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Novo Flashcard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Frente (Pergunta)</label>
            <Textarea
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              placeholder="Digite a pergunta..."
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Verso (Resposta)</label>
            <Textarea
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              placeholder="Digite a resposta..."
              rows={2}
            />
          </div>
          <Button onClick={handleAdd} disabled={!newFront.trim() || !newBack.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardContent>
      </Card>

      {/* Card list */}
      <div className="space-y-3">
        <h3 className="font-medium">Flashcards ({cards.length})</h3>
        {cards.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum flashcard ainda.</p>
        ) : (
          cards.map((card, index) => (
            <Card key={card.id}>
              <CardContent className="p-4">
                {editingId === card.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Frente</label>
                      <Textarea
                        value={editFront}
                        onChange={(e) => setEditFront(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Verso</label>
                      <Textarea
                        value={editBack}
                        onChange={(e) => setEditBack(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>
                        <Save className="w-4 h-4 mr-1" />
                        Salvar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{card.front}</p>
                      <p className="text-sm text-muted-foreground">{card.back}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(card)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar flashcard?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(card.id)}>
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
