import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { KnowledgeConcept, KnowledgeRelationship, ConceptCategory, ConceptDifficulty, RelationshipType } from '@/types/knowledge';
import { toast } from 'sonner';

export const useKnowledgeMap = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: concepts = [], isLoading } = useQuery({
    queryKey: ['knowledge-concepts', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('knowledge_concepts')
        .select(`
          *,
          knowledge_concept_tags(tag_id, tags(*))
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        title: c.title,
        description: c.description,
        codeExample: c.code_example,
        category: c.category,
        technology: c.technology,
        difficulty: c.difficulty,
        folderId: c.folder_id,
        tags: c.knowledge_concept_tags?.map((t: any) => ({
          id: t.tags.id,
          name: t.tags.name,
          color: t.tags.color,
        })) || [],
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })) as KnowledgeConcept[];
    },
    enabled: !!user,
  });

  const { data: relationships = [] } = useQuery({
    queryKey: ['knowledge-relationships', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('knowledge_relationships')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      return data.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        sourceConceptId: r.source_concept_id,
        targetConceptId: r.target_concept_id,
        relationshipType: r.relationship_type,
        description: r.description,
        createdAt: r.created_at,
      })) as KnowledgeRelationship[];
    },
    enabled: !!user,
  });

  const createConcept = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      codeExample?: string;
      category: ConceptCategory;
      technology?: string;
      difficulty: ConceptDifficulty;
      folderId?: string;
      tagIds?: string[];
    }) => {
      const { data: concept, error } = await (supabase as any)
        .from('knowledge_concepts')
        .insert({
          user_id: user?.id,
          title: data.title,
          description: data.description,
          code_example: data.codeExample,
          category: data.category,
          technology: data.technology,
          difficulty: data.difficulty,
          folder_id: data.folderId,
        })
        .select()
        .single();
      
      if (error) throw error;

      if (data.tagIds && data.tagIds.length > 0) {
        const tagInserts = data.tagIds.map(tagId => ({
          concept_id: concept.id,
          tag_id: tagId,
        }));
        await (supabase as any).from('knowledge_concept_tags').insert(tagInserts);
      }

      return concept;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-concepts'] });
      toast.success('Conceito criado!');
    },
    onError: () => toast.error('Erro ao criar conceito'),
  });

  const updateConcept = useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      description: string;
      codeExample?: string;
      category: ConceptCategory;
      technology?: string;
      difficulty: ConceptDifficulty;
      folderId?: string;
      tagIds?: string[];
    }) => {
      const { error } = await (supabase as any)
        .from('knowledge_concepts')
        .update({
          title: data.title,
          description: data.description,
          code_example: data.codeExample,
          category: data.category,
          technology: data.technology,
          difficulty: data.difficulty,
          folder_id: data.folderId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
      
      if (error) throw error;

      await (supabase as any).from('knowledge_concept_tags').delete().eq('concept_id', data.id);
      if (data.tagIds && data.tagIds.length > 0) {
        const tagInserts = data.tagIds.map(tagId => ({
          concept_id: data.id,
          tag_id: tagId,
        }));
        await (supabase as any).from('knowledge_concept_tags').insert(tagInserts);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-concepts'] });
      toast.success('Conceito atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar conceito'),
  });

  const deleteConcept = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('knowledge_concepts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-concepts'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-relationships'] });
      toast.success('Conceito removido!');
    },
    onError: () => toast.error('Erro ao remover conceito'),
  });

  const createRelationship = useMutation({
    mutationFn: async (data: {
      sourceConceptId: string;
      targetConceptId: string;
      relationshipType: RelationshipType;
      description?: string;
    }) => {
      const { error } = await (supabase as any)
        .from('knowledge_relationships')
        .insert({
          user_id: user?.id,
          source_concept_id: data.sourceConceptId,
          target_concept_id: data.targetConceptId,
          relationship_type: data.relationshipType,
          description: data.description,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-relationships'] });
      toast.success('Relação criada!');
    },
    onError: () => toast.error('Erro ao criar relação'),
  });

  const deleteRelationship = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('knowledge_relationships')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-relationships'] });
      toast.success('Relação removida!');
    },
    onError: () => toast.error('Erro ao remover relação'),
  });

  const getConceptWithRelations = useCallback((conceptId: string) => {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) return null;

    const relatedConcepts = relationships
      .filter(r => r.sourceConceptId === conceptId || r.targetConceptId === conceptId)
      .map(r => {
        const isOutgoing = r.sourceConceptId === conceptId;
        const relatedConceptId = isOutgoing ? r.targetConceptId : r.sourceConceptId;
        const relatedConcept = concepts.find(c => c.id === relatedConceptId);
        
        return relatedConcept ? {
          concept: relatedConcept,
          relationship: r,
          direction: isOutgoing ? 'outgoing' as const : 'incoming' as const,
        } : null;
      })
      .filter(Boolean) as any[];

    return { ...concept, relatedConcepts };
  }, [concepts, relationships]);

  return {
    concepts,
    relationships,
    isLoading,
    createConcept,
    updateConcept,
    deleteConcept,
    createRelationship,
    deleteRelationship,
    getConceptWithRelations,
  };
};
