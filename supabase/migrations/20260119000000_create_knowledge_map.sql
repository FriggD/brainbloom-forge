-- Knowledge Map Tables for Tech Concepts

-- Main concepts table
CREATE TABLE IF NOT EXISTS knowledge_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code_example TEXT,
  category TEXT NOT NULL,
  technology TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships between concepts
CREATE TABLE IF NOT EXISTS knowledge_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_concept_id UUID NOT NULL REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
  target_concept_id UUID NOT NULL REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags for concepts
CREATE TABLE IF NOT EXISTS knowledge_concept_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID NOT NULL REFERENCES knowledge_concepts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(concept_id, tag_id)
);

-- Enable RLS
ALTER TABLE knowledge_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_concept_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own concepts" ON knowledge_concepts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own concepts" ON knowledge_concepts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own concepts" ON knowledge_concepts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own concepts" ON knowledge_concepts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own relationships" ON knowledge_relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own relationships" ON knowledge_relationships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own relationships" ON knowledge_relationships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own relationships" ON knowledge_relationships FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own concept tags" ON knowledge_concept_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM knowledge_concepts WHERE id = concept_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own concept tags" ON knowledge_concept_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM knowledge_concepts WHERE id = concept_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own concept tags" ON knowledge_concept_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM knowledge_concepts WHERE id = concept_id AND user_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_knowledge_concepts_user ON knowledge_concepts(user_id);
CREATE INDEX idx_knowledge_concepts_category ON knowledge_concepts(category);
CREATE INDEX idx_knowledge_concepts_technology ON knowledge_concepts(technology);
CREATE INDEX idx_knowledge_relationships_source ON knowledge_relationships(source_concept_id);
CREATE INDEX idx_knowledge_relationships_target ON knowledge_relationships(target_concept_id);
CREATE INDEX idx_knowledge_concept_tags_concept ON knowledge_concept_tags(concept_id);
