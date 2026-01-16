import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Keyword } from '@/types/study';

interface KeywordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (keyword: Keyword) => void;
}

export const KeywordDialog = ({ open, onOpenChange, onSave }: KeywordDialogProps) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;

    onSave({
      id: crypto.randomUUID(),
      text: text.trim(),
    });

    setText('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Palavra-Chave</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Palavra-chave ou Tópico</Label>
            <Input
              id="keyword"
              placeholder="Ex: Osso, Articulação, Músculo..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
