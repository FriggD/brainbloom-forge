import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, ExternalLink, Star, FolderOpen, Tag as TagIcon, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { CreateContentDialog } from '@/components/content-hub/CreateContentDialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const typeConfig = {
  article: { label: 'Artigo', color: 'bg-blue-500' },
  video: { label: 'Vídeo', color: 'bg-red-500' },
  educational_site: { label: 'Site Didático', color: 'bg-green-500' },
  resource: { label: 'Recurso', color: 'bg-purple-500' },
};

const priorityStars = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const ContentHubPage = () => {
  const { user } = useAuth();
  const { folders } = useStudy();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: contents = [] } = useQuery({
    queryKey: ['content-hub', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_hub')
        .select(`
          *,
          content_hub_tags(tag_id, tags(id, name, color))
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteContent = useMutation({
    mutationFn: async (contentId: string) => {
      const { error } = await supabase
        .from('content_hub')
        .delete()
        .eq('id', contentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-hub'] });
      toast.success('Conteúdo excluído!');
    },
  });

  const handleDelete = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir este conteúdo?')) {
      deleteContent.mutate(contentId);
    }
  };

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return null;
    const folder = folders.find(f => f.id === folderId);
    return folder?.name;
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-8 h-8" />
              Hub de Conteúdo
            </h1>
            <p className="text-muted-foreground mt-1">Salve artigos, vídeos e recursos externos</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Conteúdo
          </Button>
        </div>

        {contents.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo salvo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece salvando artigos, vídeos e recursos para estudar depois
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conteúdo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.map((content) => {
              const typeInfo = typeConfig[content.type as keyof typeof typeConfig];
              const folderName = getFolderName(content.folder_id);
              const tags = content.content_hub_tags?.map((ct: any) => ct.tags) || [];

              return (
                <Card key={content.id} className="flex flex-col relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => handleDelete(e, content.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                      <div className="flex">
                        {Array.from({ length: priorityStars[content.priority as keyof typeof priorityStars] }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {content.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {content.description}
                      </p>
                    )}
                    
                    {folderName && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <FolderOpen className="w-3 h-3" />
                        {folderName}
                      </div>
                    )}

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {tags.map((tag: any) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: tag.color, color: tag.color }}
                          >
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(content.link, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <CreateContentDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      </div>
    </Layout>
  );
};

export default ContentHubPage;
