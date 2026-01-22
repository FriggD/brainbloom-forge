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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [color, setColor] = useState('#6366f1');

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#84cc16', '#10b981', '#14b8a6', '#06b6d4',
  ];

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
    setColor('#6366f1');
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: color }} />
                  Selecionar cor
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded border-2 transition-all hover:scale-110"
                      style={{ 
                        backgroundColor: c,
                        borderColor: color === c ? '#000' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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
