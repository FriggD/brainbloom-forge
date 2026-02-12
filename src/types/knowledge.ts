export type ConceptCategory = 
  | 'backend'
  | 'frontend'
  | 'database'
  | 'devops'
  | 'architecture'
  | 'testing'
  | 'security'
  | 'other';

export type ConceptDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type RelationshipType = 
  | 'depends_on'
  | 'implements'
  | 'extends'
  | 'uses'
  | 'related_to'
  | 'part_of';

export interface KnowledgeConcept {
  id: string;
  userId: string;
  title: string;
  description: string;
  codeExample?: string;
  category: ConceptCategory;
  technology?: string;
  difficulty: ConceptDifficulty;
  folderId?: string;
  tags: Array<{ id: string; name: string; color: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeRelationship {
  id: string;
  userId: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationshipType: RelationshipType;
  description?: string;
  createdAt: string;
}

export interface ConceptWithRelations extends KnowledgeConcept {
  relatedConcepts: Array<{
    concept: KnowledgeConcept;
    relationship: KnowledgeRelationship;
    direction: 'outgoing' | 'incoming';
  }>;
}
