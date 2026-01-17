import { useState, useCallback } from 'react';
import { Plus, X, Tag as TagIcon, Star, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KeywordDialog } from '@/components/dialogs/KeywordDialog';
import { CornellNote as CornellNoteType, Keyword, Priority, Tag } from '@/types/study';
import { useStudy } from '@/contexts/StudyContext';
import { cn } from '@/lib/utils';
import { useAutoSave } from '@/hooks/useAutoSave';

interface CornellNoteEditorProps {
  note?: CornellNoteType;
  onSave: (note: CornellNoteType) => void;
  onAutoSave?: (note: CornellNoteType) => void;
}

const priorityConfig: Record<Priority, { label: string; color: string; stars: number }> = {
  low: { label: 'Baixa', color: 'bg-muted text-muted-foreground', stars: 1 },
  medium: { label: 'Média', color: 'bg-chart-5/20 text-foreground', stars: 2 },
  high: { label: 'Alta', color: 'bg-chart-2/20 text-accent-foreground', stars: 3 },
  critical: { label: 'Crítica', color: 'bg-primary/20 text-primary', stars: 4 },
};

export const CornellNoteEditor = ({ note, onSave, onAutoSave }: CornellNoteEditorProps) => {
  const { tags, folders, selectedFolderId } = useStudy();
  const [showKeywordDialog, setShowKeywordDialog] = useState(false);
  const [hasManualSave, setHasManualSave] = useState(false);

  const [formData, setFormData] = useState<Omit<CornellNoteType, 'id' | 'createdAt' | 'updatedAt'>>({
    title: note?.title || '',
    subject: note?.subject || '',
    date: note?.date || new Date().toISOString().split('T')[0],
    lessonNumber: note?.lessonNumber || '',
    keywords: note?.keywords || [],
    mainNotes: note?.mainNotes || '',
    summary: note?.summary || '',
    tags: note?.tags || [],
    priority: note?.priority || 'medium',
    folderId: note?.folderId || selectedFolderId || undefined,
  });

  const handleAddKeyword = (keyword: Keyword) => {
    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, keyword],
    }));
  };

  const handleRemoveKeyword = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k.id !== id),
    }));
  };

  const handleToggleTag = (tag: Tag) => {
    setFormData((prev) => {
      const exists = prev.tags.some((t) => t.id === tag.id);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t.id !== tag.id) : [...prev.tags, tag],
      };
    });
  };

  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    
    // Generate auto-save title if empty
    const finalTitle = formData.title.trim() || (() => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `auto-save[${day}-${month}/${hours}:${minutes}]`;
    })();
    
    const noteData = {
      ...formData,
      title: finalTitle,
      id: note?.id || crypto.randomUUID(),
      createdAt: note?.createdAt || now,
      updatedAt: now,
    };
    
    onSave(noteData);
    setHasManualSave(true);
    setTimeout(() => setHasManualSave(false), 2000);
  }, [formData, note, onSave]);

  const handleAutoSave = useCallback(() => {
    const now = new Date().toISOString();
    
    // Generate auto-save title if empty
    const finalTitle = formData.title.trim() || (() => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `auto-save[${day}-${month}/${hours}:${minutes}]`;
    })();
    
    const noteData = {
      ...formData,
      title: finalTitle,
      id: note?.id || crypto.randomUUID(),
      createdAt: note?.createdAt || now,
      updatedAt: now,
    };
    
    if (onAutoSave) {
      onAutoSave(noteData);
    } else {
      onSave(noteData);
    }
  }, [formData, note, onSave, onAutoSave]);

  // Auto-save with debounce
  const { isSaving } = useAutoSave(formData, {
    delay: 2000,
    onSave: handleAutoSave,
    enabled: true,
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Disciplina / Título
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Anatomia Humana"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Data
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Nº da Aula
            </label>
            <Input
              value={formData.lessonNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, lessonNumber: e.target.value }))}
              placeholder="Ex: 01"
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <Card className="mb-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[400px]">
          {/* Keywords Column */}
          <div className="border-r border-border p-4 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Palavras-Chave
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowKeywordDialog(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.keywords.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Clique no + para adicionar palavras-chave
                </p>
              ) : (
                formData.keywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className="flex items-center gap-2 group"
                  >
                    <span className="text-primary">•</span>
                    <span className="flex-1 text-sm">{keyword.text}</span>
                    <button
                      onClick={() => handleRemoveKeyword(keyword.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Notes Column */}
          <div className="md:col-span-2 p-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Anotações Principais
            </h3>
            <Textarea
              value={formData.mainNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, mainNotes: e.target.value }))}
              placeholder="Escreva suas anotações principais aqui..."
              className="min-h-[320px] resize-none border-0 focus-visible:ring-0 p-0 text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Summary Section */}
        <div className="border-t border-border p-4 bg-muted/30">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Resumo
          </h3>
          <Textarea
            value={formData.summary}
            onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
            placeholder="Sintetize os pontos principais em suas próprias palavras..."
            className="min-h-[100px] resize-none"
          />
        </div>
      </Card>

      {/* Tags and Priority */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Tags */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <TagIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={formData.tags.some((t) => t.id === tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="w-48">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Importância</span>
            </div>
            <Select
              value={formData.priority}
              onValueChange={(value: Priority) =>
                setFormData((prev) => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: config.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current text-primary" />
                        ))}
                      </div>
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Folder */}
          <div className="w-48">
            <div className="text-sm font-medium mb-3">Pasta</div>
            <Select
              value={formData.folderId || 'none'}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, folderId: value === 'none' ? undefined : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem pasta</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.parentId ? '↳ ' : ''}{folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            )}
            {hasManualSave && (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Salvo!</span>
              </>
            )}
          </div>
          <Button onClick={handleSave} size="lg" disabled={isSaving}>
            Salvar Anotação
          </Button>
        </div>
      </Card>

      <KeywordDialog
        open={showKeywordDialog}
        onOpenChange={setShowKeywordDialog}
        onSave={handleAddKeyword}
      />
    </div>
  );
};
