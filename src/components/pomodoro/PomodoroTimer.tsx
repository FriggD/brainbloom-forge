import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const PomodoroTimer = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [sessionStart, setSessionStart] = useState<Date | null>(null);

  const { data: settings } = useQuery({
    queryKey: ['pomodoro-settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pomodoro_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || { work_duration: 25, short_break: 5, long_break: 15, sessions_until_long_break: 4 };
    },
    enabled: !!user,
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['folders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveSession = useMutation({
    mutationFn: async (duration: number) => {
      const { error } = await supabase.from('study_sessions').insert({
        user_id: user?.id,
        folder_id: selectedFolder || null,
        subject: subject || null,
        duration,
        started_at: sessionStart,
        ended_at: new Date(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['study-stats'] });
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: any) => {
      const { error } = await supabase
        .from('pomodoro_settings')
        .upsert({ user_id: user?.id, ...newSettings, updated_at: new Date() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro-settings'] });
      toast.success('Configurações salvas!');
    },
  });

  useEffect(() => {
    if (settings) {
      setMinutes(settings.work_duration);
    }
  }, [settings]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'work' && sessionStart) {
      const duration = settings?.work_duration || 25;
      saveSession.mutate(duration);
      setSessionCount(sessionCount + 1);
      
      if (sessionCount + 1 >= (settings?.sessions_until_long_break || 4)) {
        setMode('long');
        setMinutes(settings?.long_break || 15);
        setSessionCount(0);
      } else {
        setMode('short');
        setMinutes(settings?.short_break || 5);
      }
    } else {
      setMode('work');
      setMinutes(settings?.work_duration || 25);
    }
    setSeconds(0);
    toast.success('Sessão concluída!');
  };

  const toggleTimer = () => {
    if (!isActive && mode === 'work') {
      setSessionStart(new Date());
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSessionStart(null);
    if (mode === 'work') setMinutes(settings?.work_duration || 25);
    else if (mode === 'short') setMinutes(settings?.short_break || 5);
    else setMinutes(settings?.long_break || 15);
    setSeconds(0);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Timer Pomodoro</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon"><Settings className="w-4 h-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Configurações Pomodoro</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Trabalho (min)</Label>
                <Input type="number" defaultValue={settings?.work_duration} onChange={(e) => updateSettings.mutate({ ...settings, work_duration: parseInt(e.target.value) })} />
              </div>
              <div>
                <Label>Pausa Curta (min)</Label>
                <Input type="number" defaultValue={settings?.short_break} onChange={(e) => updateSettings.mutate({ ...settings, short_break: parseInt(e.target.value) })} />
              </div>
              <div>
                <Label>Pausa Longa (min)</Label>
                <Input type="number" defaultValue={settings?.long_break} onChange={(e) => updateSettings.mutate({ ...settings, long_break: parseInt(e.target.value) })} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-center mb-4">
        <div className="text-6xl font-bold mb-2">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-sm text-muted-foreground capitalize">{mode === 'work' ? 'Trabalho' : mode === 'short' ? 'Pausa Curta' : 'Pausa Longa'}</div>
      </div>

      {mode === 'work' && (
        <div className="space-y-2 mb-4">
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger><SelectValue placeholder="Pasta (opcional)" /></SelectTrigger>
            <SelectContent>
              {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Matéria (opcional)" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <Button onClick={toggleTimer} size="lg">{isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</Button>
        <Button onClick={resetTimer} variant="outline" size="lg"><RotateCcw className="w-5 h-5" /></Button>
      </div>
    </Card>
  );
};
