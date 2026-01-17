import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileCheck, BookOpen, Calendar, AlertCircle, Trash2 } from 'lucide-react';

const eventTypes = [
  { value: 'exam', label: 'Prova', icon: FileCheck, color: '#cc2936' },
  { value: 'assignment', label: 'Trabalho', icon: BookOpen, color: '#d14081' },
  { value: 'event', label: 'Evento', icon: Calendar, color: '#6699cc' },
  { value: 'important', label: 'Importante', icon: AlertCircle, color: '#adf7b6' },
];

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  existingEvents: any[];
}

export const EventDialog = ({ open, onOpenChange, selectedDate, existingEvents }: EventDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('exam');
  const [subject, setSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate) {
      setStartDate(format(selectedDate, 'yyyy-MM-dd'));
      setEndDate('');
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setType('exam');
      setSubject('');
      setStartDate('');
      setEndDate('');
      setEditingId(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      user_id: user?.id,
      title,
      type,
      subject: subject || null,
      start_date: startDate,
      end_date: endDate || null,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Evento atualizado!');
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert(eventData);
        if (error) throw error;
        toast.success('Evento criado!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar evento');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Evento excluído!');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    } catch (error) {
      toast.error('Erro ao excluir evento');
    }
  };

  const handleEdit = (event: any) => {
    setEditingId(event.id);
    setTitle(event.title);
    setType(event.type);
    setSubject(event.subject || '');
    setStartDate(event.start_date);
    setEndDate(event.end_date || '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        {existingEvents.length > 0 && !editingId && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Eventos nesta data:</h3>
            <div className="space-y-2">
              {existingEvents.map(event => {
                const eventType = eventTypes.find(t => t.value === event.type);
                const Icon = eventType?.icon || Calendar;
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-2 rounded border"
                    style={{ borderColor: eventType?.color }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: eventType?.color }} />
                      <span className="font-medium">{event.subject || event.title}</span>
                      <span className="text-xs text-muted-foreground">({eventType?.label})</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(t => {
                  const Icon = t.icon;
                  return (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: t.color }} />
                        {t.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do evento"
              required
            />
          </div>

          <div>
            <Label>Matéria (opcional)</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Matemática"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Data Fim (opcional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
