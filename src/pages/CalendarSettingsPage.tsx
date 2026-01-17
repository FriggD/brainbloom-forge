import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileCheck, BookOpen, Calendar as CalendarIcon, AlertCircle, Trash2, Edit } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { EventDialog } from '@/components/calendar/EventDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const eventConfig = {
  exam: { color: '#cc2936', icon: FileCheck, label: 'Prova' },
  assignment: { color: '#d14081', icon: BookOpen, label: 'Trabalho' },
  event: { color: '#6699cc', icon: CalendarIcon, label: 'Evento' },
  important: { color: '#adf7b6', icon: AlertCircle, label: 'Importante' },
};

const CalendarSettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: events = [] } = useQuery({
    queryKey: ['calendar-events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_date');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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

  const groupedEvents = events.reduce((acc, event) => {
    const type = event.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Gerenciar Eventos
            </h1>
            <p className="text-muted-foreground mt-1">Configure suas datas importantes</p>
          </div>
          <Button onClick={() => { setSelectedDate(new Date()); setShowEventDialog(true); }}>
            Novo Evento
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(eventConfig).map(([type, config]) => {
            const Icon = config.icon;
            const typeEvents = groupedEvents[type] || [];
            
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                    {config.label}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({typeEvents.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {typeEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum evento cadastrado</p>
                  ) : (
                    <div className="space-y-2">
                      {typeEvents.map(event => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          style={{ borderColor: config.color + '40' }}
                        >
                          <div>
                            <p className="font-medium">{event.subject || event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(event.start_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              {event.end_date && ` - ${format(new Date(event.end_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <EventDialog
          open={showEventDialog}
          onOpenChange={setShowEventDialog}
          selectedDate={selectedDate}
          existingEvents={[]}
        />
      </div>
    </Layout>
  );
};

export default CalendarSettingsPage;
