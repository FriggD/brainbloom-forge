-- Create content_hub table
CREATE TABLE IF NOT EXISTS content_hub (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'educational_site', 'resource')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content_hub_tags junction table
CREATE TABLE IF NOT EXISTS content_hub_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_hub(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(content_id, tag_id)
);

-- Enable RLS
ALTER TABLE content_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_hub_tags ENABLE ROW LEVEL SECURITY;

-- Policies for content_hub
CREATE POLICY "Users can view their own content" ON content_hub FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own content" ON content_hub FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content" ON content_hub FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content" ON content_hub FOR DELETE USING (auth.uid() = user_id);

-- Policies for content_hub_tags
CREATE POLICY "Users can view their content tags" ON content_hub_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM content_hub WHERE content_hub.id = content_hub_tags.content_id AND content_hub.user_id = auth.uid())
);
CREATE POLICY "Users can insert their content tags" ON content_hub_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM content_hub WHERE content_hub.id = content_hub_tags.content_id AND content_hub.user_id = auth.uid())
);
CREATE POLICY "Users can delete their content tags" ON content_hub_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM content_hub WHERE content_hub.id = content_hub_tags.content_id AND content_hub.user_id = auth.uid())
);

-- Create indexes
CREATE INDEX idx_content_hub_user ON content_hub(user_id);
CREATE INDEX idx_content_hub_folder ON content_hub(folder_id);
CREATE INDEX idx_content_hub_tags_content ON content_hub_tags(content_id);
