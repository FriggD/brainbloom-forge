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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useStudy } from '@/contexts/StudyContext';

interface CreateDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    title: string,
    description: string,
    folderId?: string,
    tagIds?: string[]
  ) => Promise<void>;
}

export const CreateDeckDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: CreateDeckDialogProps) => {
  const { folders, tags } = useStudy();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await onSubmit(
      title.trim(),
      description.trim(),
      folderId || undefined,
      selectedTagIds.length > 0 ? selectedTagIds : undefined
    );
    setLoading(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFolderId('');
    setSelectedTagIds([]);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Deck</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do deck"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Pasta</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma pasta (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : undefined,
                    borderColor: tag.color,
                  }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                  {selectedTagIds.includes(tag.id) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || loading}>
            {loading ? 'Criando...' : 'Criar Deck'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
