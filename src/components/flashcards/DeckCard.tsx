import { useState, useEffect } from 'react';
import { Layers, Play, Edit2, Trash2, Upload, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlashcardDeck, Flashcard } from '@/types/flashcard';
import { useStudy } from '@/contexts/StudyContext';
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

interface DeckCardProps {
  deck: FlashcardDeck;
  cardCount: number;
  onStudy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onImport: () => void;
}

export const DeckCard = ({
  deck,
  cardCount,
  onStudy,
  onEdit,
  onDelete,
  onImport,
}: DeckCardProps) => {
  const { folders } = useStudy();
  const folder = folders.find((f) => f.id === deck.folderId);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {deck.title}
            </CardTitle>
            {deck.description && (
              <p className="text-sm text-muted-foreground mt-1">{deck.description}</p>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-destructive h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deletar deck?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os flashcards serão deletados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Deletar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{cardCount} cards</span>
          {folder && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FolderOpen className="w-3 h-3" />
                {folder.name}
              </span>
            </>
          )}
        </div>

        {deck.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deck.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-2">
          <Button size="sm" onClick={onStudy} disabled={cardCount === 0} className="w-full px-1 sm:px-2">
            <Play className="w-4 h-4" />
            <span className="hidden xl:inline ml-1">Estudar</span>
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="w-full px-1 sm:px-2">
            <Edit2 className="w-4 h-4" />
            <span className="hidden xl:inline ml-1">Editar</span>
          </Button>
          <Button size="sm" variant="outline" onClick={onImport} className="w-full px-1 sm:px-2">
            <Upload className="w-4 h-4" />
            <span className="hidden xl:inline ml-1">Importar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
