import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Clock, GraduationCap, Edit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
const DAY_MAP: Record<number, string> = { 0: 'Segunda', 1: 'Terça', 2: 'Quarta', 3: 'Quinta', 4: 'Sexta', 5: 'Sábado' };

const TIME_SLOTS: string[] = [];
for (let h = 7; h <= 22; h++) {
  for (let m = 0; m < 60; m += 5) {
    if (h === 22 && m > 0) break;
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const CLASS_COLORS = [
  '#6699cc', '#cc2936', '#d14081', '#adf7b6', '#f4a261',
  '#2a9d8f', '#e76f51', '#264653', '#a855f7', '#ec4899',
];

export interface ScheduleClass {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject: string;
  room: string | null;
  teacher: string | null;
  color: string | null;
}

const emptyForm = {
  subject: '',
  room: '',
  teacher: '',
  day_of_week: '0',
  start_time: '08:00',
  end_time: '09:30',
  color: CLASS_COLORS[0],
};

const SchedulePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const { data: classes = [] } = useQuery({
    queryKey: ['schedule-classes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_classes')
        .select('*')
        .order('start_time');
      if (error) throw error;
      return data as ScheduleClass[];
    },
    enabled: !!user,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (cls: ScheduleClass) => {
    setEditingId(cls.id);
    setForm({
      subject: cls.subject,
      room: cls.room || '',
      teacher: cls.teacher || '',
      day_of_week: String(cls.day_of_week),
      start_time: cls.start_time.slice(0, 5),
      end_time: cls.end_time.slice(0, 5),
      color: cls.color || CLASS_COLORS[0],
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        subject: form.subject,
        room: form.room || null,
        teacher: form.teacher || null,
        day_of_week: parseInt(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        color: form.color,
      };

      if (editingId) {
        const { error } = await supabase.from('schedule_classes').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('schedule_classes').insert({ ...payload, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-classes'] });
      toast.success(editingId ? 'Aula atualizada!' : 'Aula adicionada!');
      setDialogOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
    },
    onError: () => toast.error('Erro ao salvar aula'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schedule_classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-classes'] });
      toast.success('Aula removida!');
    },
    onError: () => toast.error('Erro ao remover aula'),
  });

  // Build display slots (30-min intervals for the grid view)
  const DISPLAY_SLOTS: string[] = [];
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 22 && m > 0) break;
      DISPLAY_SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  const usedTimes = classes.map(c => c.start_time.slice(0, 5));
  const usedEndTimes = classes.map(c => c.end_time.slice(0, 5));
  const allTimes = [...usedTimes, ...usedEndTimes];
  
  const minTime = allTimes.length > 0 ? allTimes.sort()[0] : '08:00';
  const maxTime = allTimes.length > 0 ? allTimes.sort().reverse()[0] : '18:00';

  // Snap min/max to nearest 30-min boundary for display
  const snapDown = (t: string) => { const [h, m] = t.split(':').map(Number); return `${String(h).padStart(2, '0')}:${m < 30 ? '00' : '30'}`; };
  const snapUp = (t: string) => { const [h, m] = t.split(':').map(Number); return m > 30 ? `${String(h + 1).padStart(2, '0')}:00` : m > 0 ? `${String(h).padStart(2, '0')}:30` : t; };

  const displaySlots = DISPLAY_SLOTS.filter(t => t >= snapDown(minTime) && t < snapUp(maxTime));
  if (displaySlots.length === 0 && classes.length === 0) {
    displaySlots.push(...DISPLAY_SLOTS.filter(t => t >= '08:00' && t <= '18:00'));
  }

  const getClassForSlot = (dayIndex: number, time: string): ScheduleClass | null => {
    return classes.find(c => 
      c.day_of_week === dayIndex && 
      c.start_time.slice(0, 5) <= time && 
      c.end_time.slice(0, 5) > time
    ) || null;
  };

  const isFirstSlotOfClass = (dayIndex: number, time: string): boolean => {
    const cls = getClassForSlot(dayIndex, time);
    return cls ? cls.start_time.slice(0, 5) === time : false;
  };

  const getClassRowSpan = (cls: ScheduleClass): number => {
    const startIdx = displaySlots.indexOf(cls.start_time.slice(0, 5));
    const endIdx = displaySlots.indexOf(cls.end_time.slice(0, 5));
    if (startIdx === -1) return 1;
    if (endIdx === -1) return displaySlots.length - startIdx;
    return endIdx - startIdx;
  };

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-7 h-7" />
              Cronograma de Aulas
            </h1>
            <p className="text-muted-foreground mt-1">Organize seus horários semanais</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nova Aula</Button>
        </div>

        {/* Dialog for create/edit */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm({ ...emptyForm }); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Aula' : 'Adicionar Aula'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Matéria *</Label>
                <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Ex: Matemática" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sala / Bloco</Label>
                  <Input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="Ex: Sala 201" />
                </div>
                <div>
                  <Label>Professor(a)</Label>
                  <Input value={form.teacher} onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))} placeholder="Ex: Prof. Silva" />
                </div>
              </div>
              <div>
                <Label>Dia da semana</Label>
                <Select value={form.day_of_week} onValueChange={v => setForm(f => ({ ...f, day_of_week: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, i) => (
                      <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Início</Label>
                  <Select value={form.start_time} onValueChange={v => setForm(f => ({ ...f, start_time: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fim</Label>
                  <Select value={form.end_time} onValueChange={v => setForm(f => ({ ...f, end_time: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.filter(t => t > form.start_time).map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Cor</Label>
                <div className="flex gap-2 mt-1">
                  {CLASS_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                      style={{ backgroundColor: c, borderColor: form.color === c ? 'hsl(var(--foreground))' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                disabled={!form.subject || saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Timetable grid */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center sticky left-0 bg-background z-10">
                    <Clock className="w-4 h-4 mx-auto" />
                  </TableHead>
                  {DAYS.map(day => (
                    <TableHead key={day} className="text-center min-w-[140px] font-semibold">{day}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displaySlots.map(time => (
                  <TableRow key={time} className="h-12">
                    <TableCell className="text-center text-xs text-muted-foreground font-mono sticky left-0 bg-background z-10 border-r">
                      {time}
                    </TableCell>
                    {DAYS.map((_, dayIndex) => {
                      const cls = getClassForSlot(dayIndex, time);
                      const isFirst = isFirstSlotOfClass(dayIndex, time);

                      if (cls && !isFirst) return null;

                      if (cls && isFirst) {
                        const span = getClassRowSpan(cls);
                        return (
                          <TableCell
                            key={dayIndex}
                            rowSpan={span}
                            className="p-1 align-top"
                          >
                            <div
                              className="rounded-lg p-2 h-full text-sm group relative cursor-pointer"
                              style={{ backgroundColor: (cls.color || '#6699cc') + '22', borderLeft: `3px solid ${cls.color || '#6699cc'}` }}
                              onClick={() => openEdit(cls)}
                            >
                              <p className="font-semibold truncate" style={{ color: cls.color || '#6699cc' }}>
                                {cls.subject}
                              </p>
                              {cls.room && <p className="text-xs text-muted-foreground truncate">{cls.room}</p>}
                              {cls.teacher && <p className="text-xs text-muted-foreground truncate">{cls.teacher}</p>}
                              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEdit(cls); }}
                                  className="p-1 rounded hover:bg-muted"
                                >
                                  <Edit className="w-3 h-3 text-muted-foreground" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(cls.id); }}
                                  className="p-1 rounded hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </button>
                              </div>
                            </div>
                          </TableCell>
                        );
                      }

                      return <TableCell key={dayIndex} className="border-r border-dashed" />;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* List view for mobile */}
        {classes.length > 0 && (
          <div className="mt-6 md:hidden space-y-3">
            <h2 className="text-lg font-semibold">Suas Aulas</h2>
            {classes.map(cls => (
              <Card key={cls.id} className="cursor-pointer" onClick={() => openEdit(cls)}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 rounded-full" style={{ backgroundColor: cls.color || '#6699cc' }} />
                    <div>
                      <p className="font-medium">{cls.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {DAY_MAP[cls.day_of_week]} • {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}
                        {cls.room && ` • ${cls.room}`}
                        {cls.teacher && ` • ${cls.teacher}`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(cls.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SchedulePage;
