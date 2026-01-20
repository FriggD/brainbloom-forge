import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudy } from '@/contexts/StudyContext';
import { toast } from 'sonner';

interface PomodoroSettings {
  work_duration: number;
  short_break: number;
  long_break: number;
  sessions_until_long_break: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  work_duration: 25,
  short_break: 5,
  long_break: 15,
  sessions_until_long_break: 4,
};

export const PomodoroTimer = () => {
  const { folders } = useStudy();
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem('pomodoroSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [minutes, setMinutes] = useState(settings.work_duration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
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
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
      setSessionCount(sessionCount + 1);
      
      if (sessionCount + 1 >= settings.sessions_until_long_break) {
        setMode('long');
        setMinutes(settings.long_break);
        setSessionCount(0);
      } else {
        setMode('short');
        setMinutes(settings.short_break);
      }
    } else {
      setMode('work');
      setMinutes(settings.work_duration);
    }
    setSeconds(0);
    toast.success('Sessão concluída!');
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') setMinutes(settings.work_duration);
    else if (mode === 'short') setMinutes(settings.short_break);
    else setMinutes(settings.long_break);
    setSeconds(0);
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (mode === 'work' && !isActive) setMinutes(updated.work_duration);
    else if (mode === 'short' && !isActive) setMinutes(updated.short_break);
    else if (mode === 'long' && !isActive) setMinutes(updated.long_break);
    toast.success('Configurações salvas!');
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
                <Input 
                  type="number" 
                  value={settings.work_duration} 
                  onChange={(e) => updateSettings({ work_duration: parseInt(e.target.value) || 25 })} 
                />
              </div>
              <div>
                <Label>Pausa Curta (min)</Label>
                <Input 
                  type="number" 
                  value={settings.short_break} 
                  onChange={(e) => updateSettings({ short_break: parseInt(e.target.value) || 5 })} 
                />
              </div>
              <div>
                <Label>Pausa Longa (min)</Label>
                <Input 
                  type="number" 
                  value={settings.long_break} 
                  onChange={(e) => updateSettings({ long_break: parseInt(e.target.value) || 15 })} 
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-center mb-4">
        <div className="text-6xl font-bold mb-2">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-sm text-muted-foreground capitalize">
          {mode === 'work' ? 'Trabalho' : mode === 'short' ? 'Pausa Curta' : 'Pausa Longa'}
        </div>
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
        <Button onClick={toggleTimer} size="lg">
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Button onClick={resetTimer} variant="outline" size="lg">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
};
