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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStudy } from '@/contexts/StudyContext';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateFolderDialog = ({ open, onOpenChange }: CreateFolderDialogProps) => {
  const { folders, addFolder } = useStudy();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('none');

  const rootFolders = folders.filter((f) => !f.parentId);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await addFolder({
      name: name.trim(),
      parentId: parentId === 'none' ? undefined : parentId,
    });

    setName('');
    setParentId('none');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Pasta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da pasta</Label>
            <Input
              id="name"
              placeholder="Ex: Anatomia"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent">Pasta pai (opcional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma pasta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma (pasta raiz)</SelectItem>
                {rootFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Criar Pasta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
