import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Folder, CornellNote, MindMap, Tag } from '@/types/study';

interface StudyContextType {
  folders: Folder[];
  cornellNotes: CornellNote[];
  mindMaps: MindMap[];
  tags: Tag[];
  selectedFolderId: string | null;
  addFolder: (folder: Folder) => void;
  addCornellNote: (note: CornellNote) => void;
  updateCornellNote: (note: CornellNote) => void;
  addMindMap: (mindMap: MindMap) => void;
  updateMindMap: (mindMap: MindMap) => void;
  addTag: (tag: Tag) => void;
  setSelectedFolderId: (id: string | null) => void;
  deleteFolder: (id: string) => void;
  deleteCornellNote: (id: string) => void;
  deleteMindMap: (id: string) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'Anatomia', createdAt: new Date().toISOString() },
    { id: '2', name: 'Anatomia do Fêmur', parentId: '1', createdAt: new Date().toISOString() },
  ]);
  const [cornellNotes, setCornellNotes] = useState<CornellNote[]>([]);
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Importante', color: 'hsl(333, 71%, 50%)' },
    { id: '2', name: 'Revisão', color: 'hsl(200, 70%, 50%)' },
  ]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const addFolder = (folder: Folder) => {
    setFolders((prev) => [...prev, folder]);
  };

  const addCornellNote = (note: CornellNote) => {
    setCornellNotes((prev) => [...prev, note]);
  };

  const updateCornellNote = (note: CornellNote) => {
    setCornellNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
  };

  const addMindMap = (mindMap: MindMap) => {
    setMindMaps((prev) => [...prev, mindMap]);
  };

  const updateMindMap = (mindMap: MindMap) => {
    setMindMaps((prev) => prev.map((m) => (m.id === mindMap.id ? mindMap : m)));
  };

  const addTag = (tag: Tag) => {
    setTags((prev) => [...prev, tag]);
  };

  const deleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id && f.parentId !== id));
  };

  const deleteCornellNote = (id: string) => {
    setCornellNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteMindMap = (id: string) => {
    setMindMaps((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <StudyContext.Provider
      value={{
        folders,
        cornellNotes,
        mindMaps,
        tags,
        selectedFolderId,
        addFolder,
        addCornellNote,
        updateCornellNote,
        addMindMap,
        updateMindMap,
        addTag,
        setSelectedFolderId,
        deleteFolder,
        deleteCornellNote,
        deleteMindMap,
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
