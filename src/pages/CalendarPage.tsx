import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, FileCheck, BookOpen, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EventDialog } from '@/components/calendar/EventDialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const eventConfig = {
  exam: { color: '#cc2936', icon: FileCheck, label: 'Prova' },
  assignment: { color: '#d14081', icon: BookOpen, label: 'Trabalho' },
  event: { color: '#6699cc', icon: CalendarIcon, label: 'Evento' },
  important: { color: '#adf7b6', icon: AlertCircle, label: 'Importante' },
};

const CalendarPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter(event => {
      const eventStartStr = event.start_date.split('T')[0];
      const eventEndStr = event.end_date ? event.end_date.split('T')[0] : eventStartStr;
      return dayStr >= eventStartStr && dayStr <= eventEndStr;
    });
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setShowEventDialog(true);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Calendário Acadêmico
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie suas datas importantes</p>
          </div>
          <Button onClick={() => { setSelectedDate(new Date()); setShowEventDialog(true); }}>
            Novo Evento
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6 pb-4 border-b">
            {Object.entries(eventConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: config.color }} />
                  <span className="text-sm text-muted-foreground">{config.label}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${
                    isToday ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => {
                      const config = eventConfig[event.type as keyof typeof eventConfig];
                      const Icon = config.icon;
                      return (
                        <div
                          key={event.id}
                          className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1 truncate border"
                          style={{ 
                            backgroundColor: config.color + 'CC', 
                            borderColor: config.color,
                            color: '#ffffff'
                          }}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          <span className="truncate font-medium">{event.subject || event.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <EventDialog
          open={showEventDialog}
          onOpenChange={setShowEventDialog}
          selectedDate={selectedDate}
          existingEvents={selectedDate ? getEventsForDay(selectedDate) : []}
        />
      </div>
    </Layout>
  );
};

export default CalendarPage;
