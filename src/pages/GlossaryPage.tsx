import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
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
  BookOpen
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');

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
    mutationFn: async ({ term, definition }: { term: string; definition: string }) => {
      const { error } = await supabase.from('glossary').insert({
        user_id: user?.id,
        term: term.trim(),
        definition: definition.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
      setNewTerm('');
      setNewDefinition('');
      setIsAddOpen(false);
      toast.success('Termo adicionado ao glossário!');
    },
    onError: () => {
      toast.error('Erro ao adicionar termo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, term, definition }: { id: string; term: string; definition: string }) => {
      const { error } = await supabase
        .from('glossary')
        .update({ term: term.trim(), definition: definition.trim() })
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

  const filteredTerms = useMemo(() => {
    let filtered = terms.filter(
      (t) =>
        t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) => {
      const comparison = a.term.localeCompare(b.term, 'pt-BR');
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [terms, searchQuery, sortOrder]);

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
    addMutation.mutate({ term: newTerm, definition: newDefinition });
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
    });
  };

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
                <Button onClick={handleAddTerm} className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar termos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-2/10 rounded-lg">
                  <Search className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredTerms.length}</p>
                  <p className="text-sm text-muted-foreground">Resultados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-3/10 rounded-lg">
                  <BookA className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(groupedTerms).length}</p>
                  <p className="text-sm text-muted-foreground">Letras</p>
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
                                <h3 className="font-semibold text-lg">{term.term}</h3>
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
