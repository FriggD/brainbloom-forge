import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Clock, Flame, TrendingUp, BookOpen } from 'lucide-react';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';

export const StudyStats = () => {
  const { user } = useAuth();

  const { data: weekStats } = useQuery({
    queryKey: ['study-stats-week', user?.id],
    queryFn: async () => {
      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());
      const { data, error } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user?.id)
        .gte('started_at', start.toISOString())
        .lte('started_at', end.toISOString());
      if (error) throw error;
      return data.reduce((acc, s) => acc + s.duration, 0);
    },
    enabled: !!user,
  });

  const { data: monthStats } = useQuery({
    queryKey: ['study-stats-month', user?.id],
    queryFn: async () => {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      const { data, error } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user?.id)
        .gte('started_at', start.toISOString())
        .lte('started_at', end.toISOString());
      if (error) throw error;
      return data.reduce((acc, s) => acc + s.duration, 0);
    },
    enabled: !!user,
  });

  const { data: subjectStats } = useQuery({
    queryKey: ['study-stats-subjects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('subject, duration')
        .eq('user_id', user?.id)
        .not('subject', 'is', null);
      if (error) throw error;
      const grouped = data.reduce((acc: any, s) => {
        acc[s.subject] = (acc[s.subject] || 0) + s.duration;
        return acc;
      }, {});
      return Object.entries(grouped).map(([subject, duration]) => ({ subject, duration }));
    },
    enabled: !!user,
  });

  const { data: streak } = useQuery({
    queryKey: ['study-streak', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || { current_streak: 0, longest_streak: 0 };
    },
    enabled: !!user,
  });

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Esta Semana</p>
              <p className="text-2xl font-bold">{formatHours(weekStats || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Este Mês</p>
              <p className="text-2xl font-bold">{formatHours(monthStats || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak Atual</p>
              <p className="text-2xl font-bold">{streak?.current_streak || 0} dias</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Flame className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Melhor Streak</p>
              <p className="text-2xl font-bold">{streak?.longest_streak || 0} dias</p>
            </div>
          </div>
        </Card>
      </div>

      {subjectStats && subjectStats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Tempo por Matéria
          </h3>
          <div className="space-y-3">
            {subjectStats.map((stat: any) => (
              <div key={stat.subject} className="flex items-center justify-between">
                <span className="text-sm font-medium">{stat.subject}</span>
                <span className="text-sm text-muted-foreground">{formatHours(stat.duration)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
