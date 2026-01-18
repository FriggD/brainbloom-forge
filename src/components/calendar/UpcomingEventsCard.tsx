import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const eventConfig = {
  exam: { color: '#cc2936', icon: FileCheck, label: 'Prova', days: 45 },
  assignment: { color: '#d14081', icon: BookOpen, label: 'Trabalho', days: 7 },
  event: { color: '#6699cc', icon: Calendar, label: 'Evento', days: 15 },
  important: { color: '#adf7b6', icon: AlertCircle, label: 'Importante', days: 30 },
};

export const UpcomingEventsCard = () => {
  const { user } = useAuth();
  const today = new Date();

  const { data: events = [] } = useQuery({
    queryKey: ['calendar-events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_date', today.toISOString().split('T')[0])
        .order('start_date');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upcomingEvents = events.filter(event => {
    const config = eventConfig[event.type as keyof typeof eventConfig];
    const daysUntil = differenceInDays(new Date(event.start_date), today);
    return daysUntil <= config.days;
  });

  if (upcomingEvents.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingEvents.map(event => {
            const config = eventConfig[event.type as keyof typeof eventConfig];
            const Icon = config.icon;
            const daysUntil = differenceInDays(new Date(event.start_date), today);
            
            return (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: config.color + '15', borderLeft: `4px solid ${config.color}` }}
              >
                <Icon className="w-5 h-5 shrink-0" style={{ color: config.color }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{event.subject || event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_date), "d 'de' MMMM", { locale: ptBR })}
                    {daysUntil === 0 && ' - Hoje!'}
                    {daysUntil === 1 && ' - Amanhã'}
                    {daysUntil > 1 && ` - em ${daysUntil} dias`}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: config.color + '30', color: config.color }}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
        <Link to="/calendar" className="block mt-4">
          <p className="text-sm text-primary hover:underline text-center">Ver calendário completo →</p>
        </Link>
      </CardContent>
    </Card>
  );
};
