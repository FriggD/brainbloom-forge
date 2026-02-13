import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKnowledgeMap } from '@/hooks/useKnowledgeMap';
import { useStudy } from '@/contexts/StudyContext';
import { 
  Network, 
  Plus, 
  Search, 
  Code2, 
  Edit2, 
  Trash2, 
  Link2,
  ArrowRight,
  Filter
} from 'lucide-react';
import type { ConceptCategory, ConceptDifficulty, KnowledgeConcept } from '@/types/knowledge';

const categories: { value: ConceptCategory; label: string; icon: string }[] = [
  { value: 'backend', label: 'Backend', icon: '🔧' },
  { value: 'frontend', label: 'Frontend', icon: '🎨' },
  { value: 'database', label: 'Database', icon: '💾' },
  { value: 'devops', label: 'DevOps', icon: '🚀' },
  { value: 'architecture', label: 'Arquitetura', icon: '🏗️' },
  { value: 'testing', label: 'Testes', icon: '🧪' },
  { value: 'security', label: 'Segurança', icon: '🔒' },
  { value: 'other', label: 'Outro', icon: '📦' },
];

const difficulties: { value: ConceptDifficulty; label: string; color: string }[] = [
  { value: 'beginner', label: 'Iniciante', color: 'bg-green-500/20 text-green-700' },
  { value: 'intermediate', label: 'Intermediário', color: 'bg-yellow-500/20 text-yellow-700' },
  { value: 'advanced', label: 'Avançado', color: 'bg-red-500/20 text-red-700' },
];

export default function KnowledgeMapPage() {
  const { concepts, isLoading, createConcept, updateConcept, deleteConcept, getConceptWithRelations } = useKnowledgeMap();
  const { folders, tags } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ConceptCategory | 'all'>('all');
  const [filterTechnology, setFilterTechnology] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<KnowledgeConcept | null>(null);
  const [viewingConcept, setViewingConcept] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    codeExample: '',
    category: 'backend' as ConceptCategory,
    technology: '',
    difficulty: 'intermediate' as ConceptDifficulty,
    folderId: 'none',
    tagIds: [] as string[],
  });

  const technologies = useMemo(() => {
    const techs = new Set(concepts.map(c => c.technology).filter(Boolean));
    return Array.from(techs).sort();
  }, [concepts]);

  const filteredConcepts = useMemo(() => {
    return concepts.filter(c => {
      const matchesSearch = 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.technology?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
      const matchesTechnology = filterTechnology === 'all' || c.technology === filterTechnology;
      
      return matchesSearch && matchesCategory && matchesTechnology;
    });
  }, [concepts, searchQuery, filterCategory, filterTechnology]);

  const groupedConcepts = useMemo(() => {
    const groups: Record<string, KnowledgeConcept[]> = {};
    filteredConcepts.forEach(c => {
      const key = c.technology || 'Sem tecnologia';
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [filteredConcepts]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      codeExample: '',
      category: 'backend',
      technology: '',
      difficulty: 'intermediate',
      folderId: 'none',
      tagIds: [],
    });
  };

  const handleCreate = () => {
    createConcept.mutate({
      ...formData,
      folderId: formData.folderId === 'none' ? undefined : formData.folderId,
      tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = (concept: KnowledgeConcept) => {
    setFormData({
      title: concept.title,
      description: concept.description,
      codeExample: concept.codeExample || '',
      category: concept.category,
      technology: concept.technology || '',
      difficulty: concept.difficulty,
      folderId: concept.folderId || 'none',
      tagIds: concept.tags.map(t => t.id),
    });
    setEditingConcept(concept);
  };

  const handleUpdate = () => {
    if (!editingConcept) return;
    updateConcept.mutate({
      id: editingConcept.id,
      ...formData,
      folderId: formData.folderId === 'none' ? undefined : formData.folderId,
      tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
    });
    setEditingConcept(null);
    resetForm();
  };

  const conceptWithRelations = viewingConcept ? getConceptWithRelations(viewingConcept) : null;

  return (
    <Layout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Network className="w-8 h-8" />
              Mapa de Conhecimento
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize conceitos técnicos interligados
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Conceito
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Conceito</DialogTitle>
              </DialogHeader>
              <ConceptForm
                formData={formData}
                setFormData={setFormData}
                folders={folders}
                tags={tags}
                onSubmit={handleCreate}
                onCancel={() => { setIsCreateOpen(false); resetForm(); }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conceitos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={(v: any) => setFilterCategory(v)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterTechnology} onValueChange={setFilterTechnology}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tecnologia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas tecnologias</SelectItem>
              {technologies.map(tech => (
                <SelectItem key={tech} value={tech}>{tech}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{concepts.length}</div>
              <div className="text-sm text-muted-foreground">Total de conceitos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{technologies.length}</div>
              <div className="text-sm text-muted-foreground">Tecnologias</div>
            </CardContent>
          </Card>
        </div>

        {/* Concepts Grid */}
        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : filteredConcepts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {concepts.length === 0
                  ? 'Nenhum conceito ainda. Crie seu primeiro!'
                  : 'Nenhum conceito encontrado.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedConcepts).map(([tech, techConcepts]) => (
              <div key={tech}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  {tech}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {techConcepts.map(concept => (
                    <ConceptCard
                      key={concept.id}
                      concept={concept}
                      onView={() => setViewingConcept(concept.id)}
                      onEdit={() => handleEdit(concept)}
                      onDelete={() => deleteConcept.mutate(concept.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingConcept} onOpenChange={(open) => !open && setEditingConcept(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Conceito</DialogTitle>
            </DialogHeader>
            <ConceptForm
              formData={formData}
              setFormData={setFormData}
              folders={folders}
              tags={tags}
              onSubmit={handleUpdate}
              onCancel={() => { setEditingConcept(null); resetForm(); }}
            />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!viewingConcept} onOpenChange={(open) => !open && setViewingConcept(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {conceptWithRelations && (
              <ConceptDetailView concept={conceptWithRelations} onClose={() => setViewingConcept(null)} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// Sub-components
function ConceptCard({ concept, onView, onEdit, onDelete }: any) {
  const category = categories.find(c => c.value === concept.category);
  const difficulty = difficulties.find(d => d.value === concept.difficulty);

  return (
    <Card className="group hover:shadow-lg transition-all cursor-pointer" onClick={onView}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category?.icon}</span>
            <Badge className={difficulty?.color}>{difficulty?.label}</Badge>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2">{concept.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{concept.description}</p>
        {concept.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {concept.tags.map((tag: any) => (
              <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color }}>
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConceptForm({ formData, setFormData, folders, tags, onSubmit, onCancel }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Título</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Repository Pattern"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Categoria</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Dificuldade</Label>
          <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Tecnologia</Label>
        <Input
          value={formData.technology}
          onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
          placeholder="Ex: .NET, React, PostgreSQL"
        />
      </div>
      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Explique o conceito..."
          rows={4}
        />
      </div>
      <div>
        <Label>Exemplo de Código (opcional)</Label>
        <Textarea
          value={formData.codeExample}
          onChange={(e) => setFormData({ ...formData, codeExample: e.target.value })}
          placeholder="Cole um exemplo de código..."
          rows={6}
          className="font-mono text-sm"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSubmit} disabled={!formData.title || !formData.description}>
          Salvar
        </Button>
      </div>
    </div>
  );
}

function ConceptDetailView({ concept, onClose }: any) {
  const category = categories.find(c => c.value === concept.category);
  const difficulty = difficulties.find(d => d.value === concept.difficulty);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{category?.icon}</span>
          <div>
            <h2 className="text-2xl font-bold">{concept.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={difficulty?.color}>{difficulty?.label}</Badge>
              {concept.technology && <Badge variant="outline">{concept.technology}</Badge>}
            </div>
          </div>
        </div>
        <p className="text-muted-foreground">{concept.description}</p>
      </div>

      {concept.codeExample && (
        <div>
          <h3 className="font-semibold mb-2">Exemplo de Código</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{concept.codeExample}</code>
          </pre>
        </div>
      )}

      {concept.relatedConcepts.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Conceitos Relacionados
          </h3>
          <div className="space-y-2">
            {concept.relatedConcepts.map((rel: any) => (
              <div key={rel.relationship.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">{rel.concept.title}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary">{rel.relationship.relationshipType}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onClose} className="w-full">Fechar</Button>
    </div>
  );
}
