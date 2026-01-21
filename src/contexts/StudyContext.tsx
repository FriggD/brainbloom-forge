import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Folder, CornellNote, MindMap, Tag, Keyword, MindMapNode } from '@/types/study';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface StudyContextType {
  folders: Folder[];
  cornellNotes: CornellNote[];
  mindMaps: MindMap[];
  tags: Tag[];
  selectedFolderId: string | null;
  loading: boolean;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
  addCornellNote: (note: Omit<CornellNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCornellNote: (note: CornellNote) => Promise<void>;
  addMindMap: (mindMap: Omit<MindMap, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMindMap: (mindMap: MindMap) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  setSelectedFolderId: (id: string | null) => void;
  deleteFolder: (id: string) => Promise<void>;
  deleteCornellNote: (id: string) => Promise<void>;
  deleteMindMap: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [cornellNotes, setCornellNotes] = useState<CornellNote[]>([]);
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setFolders([]);
      setCornellNotes([]);
      setMindMaps([]);
      setTags([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [foldersRes, notesRes, mapsRes, tagsRes] = await Promise.all([
        supabase.from('folders').select('*').order('created_at', { ascending: true }),
        supabase.from('cornell_notes').select('*').order('created_at', { ascending: false }),
        supabase.from('mind_maps').select('*').order('created_at', { ascending: false }),
        supabase.from('tags').select('*').order('created_at', { ascending: true }),
      ]);

      if (foldersRes.data) {
        setFolders(foldersRes.data.map(f => ({
          id: f.id,
          name: f.name,
          parentId: f.parent_id || undefined,
          color: f.color || undefined,
          createdAt: f.created_at,
        })));
      }

      if (notesRes.data) {
        setCornellNotes(notesRes.data.map(n => ({
          id: n.id,
          title: n.title,
          subject: n.subject || '',
          date: n.date,
          lessonNumber: n.lesson_number || undefined,
          keywords: (n.keywords as unknown as Keyword[]) || [],
          mainNotes: n.main_notes,
          summary: n.summary,
          tags: [],
          priority: n.priority as 'low' | 'medium' | 'high',
          folderId: n.folder_id || undefined,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        })));
      }

      if (mapsRes.data) {
        setMindMaps(mapsRes.data.map(m => ({
          id: m.id,
          title: m.title,
          centralConcept: m.central_concept,
          nodes: (m.nodes as unknown as MindMapNode[]) || [],
          tags: [],
          priority: m.priority as 'low' | 'medium' | 'high',
          folderId: m.folder_id || undefined,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
        })));
      }

      if (tagsRes.data) {
        setTags(tagsRes.data.map(t => ({
          id: t.id,
          name: t.name,
          color: t.color,
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addFolder = async (folder: Omit<Folder, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const { error } = await supabase.from('folders').insert({
      name: folder.name,
      parent_id: folder.parentId || null,
      color: folder.color || null,
      user_id: user.id,
    });

    if (error) {
      toast.error('Erro ao criar pasta');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Pasta criada!');
    }
  };

  const updateFolder = async (id: string, name: string) => {
    const { error } = await supabase.from('folders').update({ name }).eq('id', id);

    if (error) {
      toast.error('Erro ao renomear pasta');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Pasta renomeada!');
    }
  };

  const addCornellNote = async (note: Omit<CornellNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const { error } = await supabase.from('cornell_notes').insert({
      title: note.title,
      subject: note.subject || null,
      date: note.date,
      lesson_number: note.lessonNumber || null,
      keywords: note.keywords as unknown as Json,
      main_notes: note.mainNotes,
      summary: note.summary,
      priority: note.priority,
      folder_id: note.folderId || null,
      user_id: user.id,
    });

    if (error) {
      toast.error('Erro ao criar anotação');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Anotação criada!');
    }
  };

  const updateCornellNote = async (note: CornellNote) => {
    const { error } = await supabase.from('cornell_notes').update({
      title: note.title,
      subject: note.subject || null,
      date: note.date,
      lesson_number: note.lessonNumber || null,
      keywords: note.keywords as unknown as Json,
      main_notes: note.mainNotes,
      summary: note.summary,
      priority: note.priority,
      folder_id: note.folderId || null,
    }).eq('id', note.id);

    if (error) {
      toast.error('Erro ao atualizar anotação');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Anotação atualizada!');
    }
  };

  const addMindMap = async (mindMap: Omit<MindMap, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const { error } = await supabase.from('mind_maps').insert({
      title: mindMap.title,
      central_concept: mindMap.centralConcept,
      nodes: mindMap.nodes as unknown as Json,
      priority: mindMap.priority,
      folder_id: mindMap.folderId || null,
      user_id: user.id,
    });

    if (error) {
      toast.error('Erro ao criar mapa mental');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Mapa mental criado!');
    }
  };

  const updateMindMap = async (mindMap: MindMap) => {
    const { error } = await supabase.from('mind_maps').update({
      title: mindMap.title,
      central_concept: mindMap.centralConcept,
      nodes: mindMap.nodes as unknown as Json,
      priority: mindMap.priority,
      folder_id: mindMap.folderId || null,
    }).eq('id', mindMap.id);

    if (error) {
      toast.error('Erro ao atualizar mapa mental');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Mapa mental atualizado!');
    }
  };

  const addTag = async (tag: Omit<Tag, 'id'>) => {
    if (!user) return;

    const { error } = await supabase.from('tags').insert({
      name: tag.name,
      color: tag.color,
      user_id: user.id,
    });

    if (error) {
      toast.error('Erro ao criar tag');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Tag criada!');
    }
  };

  const deleteFolder = async (id: string) => {
    const { error } = await supabase.from('folders').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao deletar pasta');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Pasta deletada!');
    }
  };

  const deleteCornellNote = async (id: string) => {
    const { error } = await supabase.from('cornell_notes').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao deletar anotação');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Anotação deletada!');
    }
  };

  const deleteMindMap = async (id: string) => {
    const { error } = await supabase.from('mind_maps').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao deletar mapa mental');
      console.error(error);
    } else {
      await fetchData();
      toast.success('Mapa mental deletado!');
    }
  };

  return (
    <StudyContext.Provider
      value={{
        folders,
        cornellNotes,
        mindMaps,
        tags,
        selectedFolderId,
        loading,
        addFolder,
        updateFolder,
        addCornellNote,
        updateCornellNote,
        addMindMap,
        updateMindMap,
        addTag,
        setSelectedFolderId,
        deleteFolder,
        deleteCornellNote,
        deleteMindMap,
        refreshData: fetchData,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
