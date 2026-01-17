import { Tag } from './study';

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  folderId?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}
