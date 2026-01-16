import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Network, Tag, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useStudy } from '@/contexts/StudyContext';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'cornell' | 'mindmap' | 'keyword' | 'tag';
  title: string;
  subtitle?: string;
  matchedText?: string;
  path: string;
  icon: typeof FileText;
}

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearchDialog = ({ open, onOpenChange }: GlobalSearchDialogProps) => {
  const navigate = useNavigate();
  const { cornellNotes, mindMaps, tags } = useStudy();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    const matches: SearchResult[] = [];

    // Search Cornell Notes
    cornellNotes.forEach((note) => {
      const titleMatch = note.title.toLowerCase().includes(searchTerm);
      const summaryMatch = note.summary.toLowerCase().includes(searchTerm);
      const notesMatch = note.mainNotes.toLowerCase().includes(searchTerm);
      const keywordMatch = note.keywords.some((k) =>
        k.text.toLowerCase().includes(searchTerm)
      );

      if (titleMatch || summaryMatch || notesMatch || keywordMatch) {
        let matchedText = '';
        if (summaryMatch) {
          const idx = note.summary.toLowerCase().indexOf(searchTerm);
          const start = Math.max(0, idx - 30);
          const end = Math.min(note.summary.length, idx + searchTerm.length + 30);
          matchedText = (start > 0 ? '...' : '') + note.summary.slice(start, end) + (end < note.summary.length ? '...' : '');
        } else if (notesMatch) {
          const idx = note.mainNotes.toLowerCase().indexOf(searchTerm);
          const start = Math.max(0, idx - 30);
          const end = Math.min(note.mainNotes.length, idx + searchTerm.length + 30);
          matchedText = (start > 0 ? '...' : '') + note.mainNotes.slice(start, end) + (end < note.mainNotes.length ? '...' : '');
        }

        matches.push({
          id: note.id,
          type: 'cornell',
          title: note.title,
          subtitle: note.date,
          matchedText,
          path: '/cornell',
          icon: FileText,
        });
      }

      // Search keywords separately
      note.keywords.forEach((keyword) => {
        if (keyword.text.toLowerCase().includes(searchTerm)) {
          matches.push({
            id: `${note.id}-${keyword.id}`,
            type: 'keyword',
            title: keyword.text,
            subtitle: `Palavra-chave em: ${note.title}`,
            path: '/cornell',
            icon: Tag,
          });
        }
      });
    });

    // Search Mind Maps
    mindMaps.forEach((mindMap) => {
      const titleMatch = mindMap.title.toLowerCase().includes(searchTerm);
      const centralMatch = mindMap.centralConcept.toLowerCase().includes(searchTerm);
      const nodeMatch = mindMap.nodes.some((n) =>
        n.text.toLowerCase().includes(searchTerm)
      );

      if (titleMatch || centralMatch || nodeMatch) {
        const matchedNode = mindMap.nodes.find((n) =>
          n.text.toLowerCase().includes(searchTerm)
        );

        matches.push({
          id: mindMap.id,
          type: 'mindmap',
          title: mindMap.title || 'Mapa Mental',
          subtitle: `Conceito central: ${mindMap.centralConcept}`,
          matchedText: matchedNode && !titleMatch ? `Nó: "${matchedNode.text}"` : undefined,
          path: '/mindmap',
          icon: Network,
        });
      }
    });

    // Search Tags
    tags.forEach((tag) => {
      if (tag.name.toLowerCase().includes(searchTerm)) {
        const usedIn = cornellNotes.filter((n) =>
          n.tags.some((t) => t.id === tag.id)
        ).length;

        matches.push({
          id: tag.id,
          type: 'tag',
          title: tag.name,
          subtitle: `Tag usada em ${usedIn} anotação(ões)`,
          path: '/',
          icon: Tag,
        });
      }
    });

    return matches.slice(0, 10); // Limit to 10 results
  }, [query, cornellNotes, mindMaps, tags]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onOpenChange(false);
    setQuery('');
  };

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Busca Global</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 px-4 pb-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar anotações, palavras-chave, conceitos..."
            className="border-0 focus-visible:ring-0 px-0 text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Digite para buscar em todas as suas anotações</p>
              <p className="text-sm mt-1">
                Anotações Cornell, Mapas Mentais, Palavras-chave e Tags
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Nenhum resultado encontrado para "{query}"</p>
              <p className="text-sm mt-1">Tente usar outros termos</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                    index === selectedIndex
                      ? 'bg-accent'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      result.type === 'cornell' && 'bg-primary/10 text-primary',
                      result.type === 'mindmap' && 'bg-chart-2/20 text-chart-2',
                      result.type === 'keyword' && 'bg-chart-3/20 text-chart-3',
                      result.type === 'tag' && 'bg-chart-4/20 text-chart-4'
                    )}
                  >
                    <result.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {highlightMatch(result.title)}
                    </p>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    )}
                    {result.matchedText && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {highlightMatch(result.matchedText)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider shrink-0">
                    {result.type === 'cornell' && 'Cornell'}
                    {result.type === 'mindmap' && 'Mapa'}
                    {result.type === 'keyword' && 'Chave'}
                    {result.type === 'tag' && 'Tag'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">↑↓</kbd> navegar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Enter</kbd> selecionar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Esc</kbd> fechar
            </span>
          </div>
          {results.length > 0 && (
            <span>{results.length} resultado(s)</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
