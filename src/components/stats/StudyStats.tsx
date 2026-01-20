import { Card } from '@/components/ui/card';
import { useStudy } from '@/contexts/StudyContext';
import { Clock, Flame, TrendingUp, BookOpen } from 'lucide-react';

export const StudyStats = () => {
  const { cornellNotes, mindMaps, folders } = useStudy();

  // Use localStorage for streak data since we don't have the tables yet
  const getStreakData = () => {
    const saved = localStorage.getItem('studyStreak');
    if (saved) {
      return JSON.parse(saved);
    }
    return { currentStreak: 0, longestStreak: 0 };
  };

  const streakData = getStreakData();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Anotações Cornell</p>
              <p className="text-2xl font-bold">{cornellNotes.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-2/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mapas Mentais</p>
              <p className="text-2xl font-bold">{mindMaps.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-4/10 rounded-lg">
              <Flame className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak Atual</p>
              <p className="text-2xl font-bold">{streakData.currentStreak} dias</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-3/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pastas</p>
              <p className="text-2xl font-bold">{folders.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
