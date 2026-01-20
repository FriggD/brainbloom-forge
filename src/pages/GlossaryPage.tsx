import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  BookA, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  SortAsc, 
  SortDesc,
  BookOpen,
  FolderOpen,
  X
} from 'lucide-react';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function GlossaryPage() {
  const { user } = useAuth();
  const { folders } = useStudy();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterFolderId, setFilterFolderId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newFolderId, setNewFolderId] = useState<string | null>(null);

  const { data: terms = [], isLoading } = useQuery({
    queryKey: ['glossary', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('glossary')
        .select('*')
        .eq('user_id', user?.id)
        .order('term', { ascending: true });
      if (error) throw error;
      return data as GlossaryTerm[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async ({ term, definition, folder_id }: { term: string; definition: string; folder_id: string | null }) => {
      const { error } = await supabase.from('glossary').insert({
        user_id: user?.id,
        term: term.trim(),
        definition: definition.trim(),
        folder_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
      setNewTerm('');
      setNewDefinition('');
      setNewFolderId(null);
      setIsAddOpen(false);
      toast.success('Termo adicionado ao glossário!');
    },
    onError: () => {
      toast.error('Erro ao adicionar termo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, term, definition, folder_id }: { id: string; term: string; definition: string; folder_id: string | null }) => {
      const { error } = await supabase
        .from('glossary')
        .update({ term: term.trim(), definition: definition.trim(), folder_id })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
      setEditingTerm(null);
      toast.success('Termo atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar termo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('glossary').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
      toast.success('Termo removido!');
    },
    onError: () => {
      toast.error('Erro ao remover termo');
    },
  });

  // Build folder hierarchy for display
  const getFolderPath = (folderId: string | null): string => {
    if (!folderId) return '';
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return '';
    
    if (folder.parentId) {
      const parentPath = getFolderPath(folder.parentId);
      return parentPath ? `${parentPath} / ${folder.name}` : folder.name;
    }
    return folder.name;
  };

  const filteredTerms = useMemo(() => {
    let filtered = terms.filter(
      (t) =>
        t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filterFolderId) {
      filtered = filtered.filter(t => t.folder_id === filterFolderId);
    }
    
    return filtered.sort((a, b) => {
      const comparison = a.term.localeCompare(b.term, 'pt-BR');
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [terms, searchQuery, sortOrder, filterFolderId]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((term) => {
      const firstLetter = term.term[0]?.toUpperCase() || '#';
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const handleAddTerm = () => {
    if (!newTerm.trim() || !newDefinition.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    addMutation.mutate({ term: newTerm, definition: newDefinition, folder_id: newFolderId });
  };

  const handleUpdateTerm = () => {
    if (!editingTerm || !editingTerm.term.trim() || !editingTerm.definition.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    updateMutation.mutate({
      id: editingTerm.id,
      term: editingTerm.term,
      definition: editingTerm.definition,
      folder_id: editingTerm.folder_id,
    });
  };

  // Get all folders including subfolders for selection
  const allFolders = folders;

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookA className="w-8 h-8" />
              Glossário
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas expressões e definições
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Termo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Termo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="term">Expressão</Label>
                  <Input
                    id="term"
                    placeholder="Ex: Fotossíntese"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="definition">Definição</Label>
                  <Textarea
                    id="definition"
                    placeholder="Ex: Processo pelo qual as plantas convertem luz solar em energia..."
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="folder">Pasta (opcional)</Label>
                  <Select value={newFolderId || ''} onValueChange={(v) => setNewFolderId(v || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem pasta</SelectItem>
                      {allFolders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {getFolderPath(folder.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddTerm} className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar termos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterFolderId || ''} onValueChange={(v) => setFilterFolderId(v || null)}>
            <SelectTrigger className="w-[200px]">
              <FolderOpen className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Todas as pastas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as pastas</SelectItem>
              {allFolders.map(folder => (
                <SelectItem key={folder.id} value={folder.id}>
                  {getFolderPath(folder.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>

        {/* Active filters */}
        {filterFolderId && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Filtro ativo:</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              {getFolderPath(filterFolderId)}
              <button onClick={() => setFilterFolderId(null)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        )}

        {/* Stats - Only total */}
        <div className="mb-6">
          <Card className="w-fit">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{terms.length}</p>
                  <p className="text-sm text-muted-foreground">Total de termos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terms List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : filteredTerms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookA className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {terms.length === 0
                  ? 'Nenhum termo no glossário ainda. Adicione seu primeiro termo!'
                  : 'Nenhum termo encontrado para a busca.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-6">
              {Object.entries(groupedTerms)
                .sort(([a], [b]) => (sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)))
                .map(([letter, letterTerms]) => (
                  <div key={letter}>
                    <Badge variant="secondary" className="mb-3 text-lg px-3 py-1">
                      {letter}
                    </Badge>
                    <div className="space-y-3">
                      {letterTerms.map((term) => (
                        <Card key={term.id} className="group">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="font-semibold text-lg">{term.term}</h3>
                                  {term.folder_id && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <FolderOpen className="w-3 h-3" />
                                      {getFolderPath(term.folder_id)}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground mt-1">{term.definition}</p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingTerm(term)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteMutation.mutate(term.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingTerm} onOpenChange={(open) => !open && setEditingTerm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Termo</DialogTitle>
            </DialogHeader>
            {editingTerm && (
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="edit-term">Expressão</Label>
                  <Input
                    id="edit-term"
                    value={editingTerm.term}
                    onChange={(e) => setEditingTerm({ ...editingTerm, term: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-definition">Definição</Label>
                  <Textarea
                    id="edit-definition"
                    value={editingTerm.definition}
                    onChange={(e) => setEditingTerm({ ...editingTerm, definition: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-folder">Pasta (opcional)</Label>
                  <Select 
                    value={editingTerm.folder_id || ''} 
                    onValueChange={(v) => setEditingTerm({ ...editingTerm, folder_id: v || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem pasta</SelectItem>
                      {allFolders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {getFolderPath(folder.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleUpdateTerm} className="w-full" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
