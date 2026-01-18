import { useState } from 'react';
import { Plus, Network, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { MindMapCanvas } from '@/components/mindmap/MindMapCanvas';
import { useStudy } from '@/contexts/StudyContext';
import { MindMap } from '@/types/study';
import { toast } from 'sonner';

const MindMapPage = () => {
  const { mindMaps, addMindMap, updateMindMap, deleteMindMap } = useStudy();
  const [isEditing, setIsEditing] = useState(false);
  const [editingMindMap, setEditingMindMap] = useState<MindMap | undefined>(undefined);

  const handleNewMindMap = () => {
    setEditingMindMap(undefined);
    setIsEditing(true);
  };

  const handleEditMindMap = (mindMap: MindMap) => {
    setEditingMindMap(mindMap);
    setIsEditing(true);
  };

  const handleSave = (mindMap: MindMap) => {
    if (editingMindMap) {
      updateMindMap(mindMap);
      toast.success('Mapa mental atualizado com sucesso!');
    } else {
      addMindMap(mindMap);
      toast.success('Mapa mental criado com sucesso!');
    }
    setIsEditing(false);
    setEditingMindMap(undefined);
  };

  const handleAutoSave = (mindMap: MindMap) => {
    if (editingMindMap) {
      updateMindMap(mindMap);
    } else {
      addMindMap(mindMap);
      setEditingMindMap(mindMap);
    }
  };

  const handleDelete = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir este mapa mental?')) {
      deleteMindMap(mapId);
      toast.success('Mapa mental excluído!');
    }
  };

  if (isEditing) {
    return (
      <Layout>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <h1 className="text-xl font-semibold">
              {editingMindMap ? 'Editar Mapa Mental' : 'Novo Mapa Mental'}
            </h1>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </div>
          <div className="flex-1">
            <MindMapCanvas mindMap={editingMindMap} onSave={handleSave} onAutoSave={handleAutoSave} />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mind Mapping</h1>
            <p className="text-muted-foreground mt-1">
              Conecte ideias visualmente com mapas mentais interativos
            </p>
          </div>
          <Button onClick={handleNewMindMap}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Mapa Mental
          </Button>
        </div>

        {mindMaps.length === 0 ? (
          <Card className="max-w-lg mx-auto mt-16">
            <CardContent className="pt-8 text-center">
              <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum mapa mental ainda</h3>
              <p className="text-muted-foreground mb-4">
                Mind Mapping é uma técnica visual para conectar conceitos e ideias
                de forma criativa e organizada.
              </p>
              <Button onClick={handleNewMindMap}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Mapa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mindMaps.map((mindMap) => (
              <Card
                key={mindMap.id}
                className="hover:shadow-lg transition-all cursor-pointer group relative"
                onClick={() => handleEditMindMap(mindMap)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => handleDelete(e, mindMap.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Network className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {mindMap.title || 'Sem título'}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Conceito: {mindMap.centralConcept}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mindMap.nodes.length} nós
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MindMapPage;
