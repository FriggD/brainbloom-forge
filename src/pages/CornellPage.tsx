import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { CornellNoteEditor } from '@/components/cornell/CornellNote';
import { useStudy } from '@/contexts/StudyContext';
import { CornellNote } from '@/types/study';
import { toast } from 'sonner';

const CornellPage = () => {
  const { cornellNotes, addCornellNote, updateCornellNote } = useStudy();
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<CornellNote | undefined>(undefined);

  const handleNewNote = () => {
    setEditingNote(undefined);
    setIsEditing(true);
  };

  const handleEditNote = (note: CornellNote) => {
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleSave = (note: CornellNote) => {
    if (editingNote) {
      updateCornellNote(note);
      toast.success('Anotação atualizada com sucesso!');
    } else {
      addCornellNote(note);
      toast.success('Anotação criada com sucesso!');
    }
    setIsEditing(false);
    setEditingNote(undefined);
  };

  if (isEditing) {
    return (
      <Layout>
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <h1 className="text-xl font-semibold">
            {editingNote ? 'Editar Anotação' : 'Nova Anotação Cornell'}
          </h1>
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
        </div>
        <CornellNoteEditor note={editingNote} onSave={handleSave} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Método Cornell</h1>
            <p className="text-muted-foreground mt-1">
              Organize suas anotações de forma estruturada e eficiente
            </p>
          </div>
          <Button onClick={handleNewNote}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Anotação
          </Button>
        </div>

        {cornellNotes.length === 0 ? (
          <Card className="max-w-lg mx-auto mt-16">
            <CardContent className="pt-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma anotação ainda</h3>
              <p className="text-muted-foreground mb-4">
                O Método Cornell ajuda você a organizar suas anotações em três seções:
                palavras-chave, notas principais e resumo.
              </p>
              <Button onClick={handleNewNote}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Anotação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cornellNotes.map((note) => (
              <Card
                key={note.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleEditNote(note)}
              >
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{note.date}</p>
                  
                  {note.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw.id}
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                        >
                          {kw.text}
                        </span>
                      ))}
                      {note.keywords.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{note.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {note.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.summary}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CornellPage;
