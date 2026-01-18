import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Network, CreditCard, FolderOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FolderViewPage() {
  const { folderId } = useParams();
  const { user } = useAuth();

  const { data: folder } = useQuery({
    queryKey: ['folder', folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!folderId,
  });

  const { data: subfolders = [] } = useQuery({
    queryKey: ['subfolders', folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('parent_id', folderId)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!folderId,
  });

  const { data: cornellNotes = [] } = useQuery({
    queryKey: ['cornell-notes-folder', folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cornell_notes')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!folderId,
  });

  const { data: mindMaps = [] } = useQuery({
    queryKey: ['mind-maps-folder', folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!folderId,
  });

  const { data: flashcardDecks = [] } = useQuery({
    queryKey: ['flashcard-decks-folder', folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!folderId,
  });

  const { data: contentHub = [] } = useQuery({
    queryKey: ['content-hub-folder', folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_hub')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!folderId,
  });

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: folder?.color || '#6366f1' }}>
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{folder?.name}</h1>
              <p className="text-muted-foreground">
                {cornellNotes.length + mindMaps.length + flashcardDecks.length + contentHub.length} itens
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {subfolders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Subpastas ({subfolders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {subfolders.map(subfolder => (
                  <Link key={subfolder.id} to={`/folder/${subfolder.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: subfolder.color || '#6366f1' }}>
                          <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold">{subfolder.name}</h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {cornellNotes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Anotações Cornell ({cornellNotes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cornellNotes.map(note => (
                  <Link key={note.id} to={`/cornell?id=${note.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer">
                      <h3 className="font-semibold mb-2">{note.title}</h3>
                      <p className="text-sm text-muted-foreground">{note.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">{note.date}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {mindMaps.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5" />
                Mapas Mentais ({mindMaps.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mindMaps.map(map => (
                  <Link key={map.id} to={`/mindmap?id=${map.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer">
                      <h3 className="font-semibold mb-2">{map.title}</h3>
                      <p className="text-sm text-muted-foreground">{map.central_concept}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {flashcardDecks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Flashcards ({flashcardDecks.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashcardDecks.map(deck => (
                  <Link key={deck.id} to={`/flashcards?deck=${deck.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer">
                      <h3 className="font-semibold mb-2">{deck.title}</h3>
                      <p className="text-sm text-muted-foreground">{deck.description}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {subfolders.length === 0 && cornellNotes.length === 0 && mindMaps.length === 0 && flashcardDecks.length === 0 && contentHub.length === 0 && (
            <Card className="p-12 text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Pasta vazia</h3>
              <p className="text-muted-foreground">Nenhum conteúdo nesta pasta ainda</p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
