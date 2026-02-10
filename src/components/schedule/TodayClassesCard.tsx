import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const DAY_MAP: Record<number, string> = { 0: 'Segunda', 1: 'Terça', 2: 'Quarta', 3: 'Quinta', 4: 'Sexta', 5: 'Sábado' };

// JS getDay(): 0=Sunday,1=Monday...6=Saturday → our schema: 0=Monday...5=Saturday
const jsToScheduleDay = (jsDay: number): number => {
  if (jsDay === 0) return -1; // Sunday - no classes
  return jsDay - 1; // Mon=0, Tue=1, ...Sat=5
};

export const TodayClassesCard = () => {
  const { user } = useAuth();
  const today = new Date();
  const todayScheduleDay = jsToScheduleDay(today.getDay());

  const { data: todayClasses = [] } = useQuery({
    queryKey: ['schedule-classes-today', user?.id, todayScheduleDay],
    queryFn: async () => {
      if (todayScheduleDay < 0) return [];
      const { data, error } = await supabase
        .from('schedule_classes')
        .select('*')
        .eq('day_of_week', todayScheduleDay)
        .order('start_time');
      if (error) throw error;
      return data;
    },
    enabled: !!user && todayScheduleDay >= 0,
  });

  if (todayClasses.length === 0) return null;

  const now = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Aulas de Hoje — {DAY_MAP[todayScheduleDay]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {todayClasses.map((cls) => {
            const startTime = cls.start_time.slice(0, 5);
            const endTime = cls.end_time.slice(0, 5);
            const isNow = now >= startTime && now < endTime;
            const isPast = now >= endTime;

            return (
              <div
                key={cls.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isNow ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : isPast ? 'opacity-50' : ''
                }`}
                style={{ borderLeftWidth: '3px', borderLeftColor: cls.color || '#6699cc' }}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono min-w-[90px]">
                  <Clock className="w-3 h-3" />
                  {startTime} - {endTime}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: isNow ? cls.color || undefined : undefined }}>
                    {cls.subject}
                    {isNow && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Agora</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cls.room && cls.room}
                    {cls.room && cls.teacher && ' • '}
                    {cls.teacher && cls.teacher}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <Link to="/schedule" className="block text-center text-sm text-primary hover:underline mt-3">
          Ver cronograma completo →
        </Link>
      </CardContent>
    </Card>
  );
};
