export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Keyword {
  id: string;
  text: string;
}

export interface CornellNote {
  id: string;
  title: string;
  subject: string;
  date: string;
  lessonNumber?: string;
  keywords: Keyword[];
  mainNotes: string;
  summary: string;
  tags: Tag[];
  priority: Priority;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId?: string;
  color?: string;
}

export interface MindMap {
  id: string;
  title: string;
  centralConcept: string;
  nodes: MindMapNode[];
  tags: Tag[];
  priority: Priority;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  createdAt: string;
}

export interface StudyItem {
  type: 'cornell' | 'mindmap';
  item: CornellNote | MindMap;
}
