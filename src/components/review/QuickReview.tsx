import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Brain, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const QuickReview = () => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const { data: notes = [] } = useQuery({
    queryKey: ['cornell-notes-review', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cornell_notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const currentNote = notes[currentIndex];

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % notes.length);
  };

  if (!notes.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma anotação para revisar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Revisão Rápida
        </h3>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {notes.length}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {currentNote.subject} • {format(new Date(currentNote.date), 'dd MMM yyyy', { locale: ptBR })}
          </p>
          <h4 className="text-xl font-semibold mb-4">{currentNote.title}</h4>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Palavras-chave:</p>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(currentNote.keywords) ? (
              currentNote.keywords.map((kw: any, i: number) => (
                <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                  {typeof kw === 'string' ? kw : kw.text || kw.id}
                </span>
              ))
            ) : null}
          </div>
        </div>

        {showAnswer ? (
          <div className="space-y-3">
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <p className="text-sm font-medium mb-2 text-green-700 dark:text-green-400">Resumo:</p>
              <p className="text-sm">{currentNote.summary}</p>
            </div>
            <Button onClick={handleNext} className="w-full">
              Próxima <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <Button onClick={() => setShowAnswer(true)} variant="outline" className="w-full">
            Mostrar Resposta
          </Button>
        )}
      </div>
    </Card>
  );
};
