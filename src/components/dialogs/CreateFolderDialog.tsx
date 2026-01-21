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
import { cn } from '@/lib/utils';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const folderColors = [
  { name: 'Padrão', value: '' },
  { name: 'Vermelho', value: 'hsl(0, 72%, 51%)' },
  { name: 'Laranja', value: 'hsl(25, 95%, 53%)' },
  { name: 'Âmbar', value: 'hsl(45, 93%, 47%)' },
  { name: 'Verde', value: 'hsl(142, 71%, 45%)' },
  { name: 'Esmeralda', value: 'hsl(160, 84%, 39%)' },
  { name: 'Ciano', value: 'hsl(187, 85%, 43%)' },
  { name: 'Azul', value: 'hsl(217, 91%, 60%)' },
  { name: 'Índigo', value: 'hsl(239, 84%, 67%)' },
  { name: 'Violeta', value: 'hsl(258, 90%, 66%)' },
  { name: 'Rosa', value: 'hsl(330, 81%, 60%)' },
];

export const CreateFolderDialog = ({ open, onOpenChange }: CreateFolderDialogProps) => {
  const { folders, addFolder } = useStudy();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('none');
  const [color, setColor] = useState<string>('');

  const rootFolders = folders.filter((f) => !f.parentId);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await addFolder({
      name: name.trim(),
      parentId: parentId === 'none' ? undefined : parentId,
      color: color || undefined,
    });

    setName('');
    setParentId('none');
    setColor('');
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
          <div className="space-y-2">
            <Label>Cor da pasta</Label>
            <div className="flex flex-wrap gap-2">
              {folderColors.map((c) => (
                <button
                  key={c.value || 'default'}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                    color === c.value ? 'border-foreground ring-2 ring-ring ring-offset-2' : 'border-transparent'
                  )}
                  style={{ 
                    backgroundColor: c.value || 'hsl(var(--primary))',
                  }}
                  title={c.name}
                />
              ))}
            </div>
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
