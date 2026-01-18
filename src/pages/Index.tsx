import { Link } from 'react-router-dom';
import { FileText, Network, FolderOpen, Tag, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudy } from '@/contexts/StudyContext';
import { Layout } from '@/components/layout/Layout';
import { UpcomingEventsCard } from '@/components/calendar/UpcomingEventsCard';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { StudyStats } from '@/components/stats/StudyStats';
import { QuickReview } from '@/components/review/QuickReview';
import { useStudyStreak } from '@/hooks/useStudyStreak';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: FileText,
    title: 'Método Cornell',
    description: 'Organize suas anotações com palavras-chave, notas principais e resumo.',
    path: '/cornell',
    color: 'text-primary',
  },
  {
    icon: Network,
    title: 'Mind Mapping',
    description: 'Crie mapas mentais visuais para conectar conceitos e ideias.',
    path: '/mindmap',
    color: 'text-chart-2',
  },
  {
    icon: FolderOpen,
    title: 'Organização por Pastas',
    description: 'Separe seus estudos por matérias e assuntos em pastas organizadas.',
    path: '/',
    color: 'text-chart-3',
  },
  {
    icon: Tag,
    title: 'Tags & Prioridades',
    description: 'Marque a importância de cada assunto para focar no que realmente importa.',
    path: '/',
    color: 'text-chart-4',
  },
];

const Index = () => {
  const { cornellNotes, mindMaps, folders } = useStudy();
  const [nickname, setNickname] = useState('StudyHub');
  useStudyStreak();

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      const data = JSON.parse(saved);
      setNickname(data.nickname || 'StudyHub');
    }
  }, []);

  const stats = [
    { label: 'Anotações Cornell', value: cornellNotes.length },
    { label: 'Mapas Mentais', value: mindMaps.length },
    { label: 'Pastas', value: folders.length },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Bem-vindo, <span className="text-primary">{nickname}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Organize seus estudos de forma inteligente com o Método Cornell e Mind Mapping.
            Nunca mais perca uma informação importante.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12">
          <StudyStats />
        </div>

        {/* Pomodoro Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <PomodoroTimer />
          <QuickReview />
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <UpcomingEventsCard />
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4 text-foreground">Começar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.path}>
              <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group">
                <CardHeader>
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="text-xl font-semibold mb-4 text-foreground">Atividade Recente</h2>
        <Card>
          <CardContent className="pt-6">
            {cornellNotes.length === 0 && mindMaps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade ainda.</p>
                <p className="text-sm mt-1">Comece criando sua primeira anotação!</p>
                <div className="flex justify-center gap-4 mt-4">
                  <Link to="/cornell">
                    <Button>
                      <FileText className="w-4 h-4 mr-2" />
                      Nova Anotação Cornell
                    </Button>
                  </Link>
                  <Link to="/mindmap">
                    <Button variant="outline">
                      <Network className="w-4 h-4 mr-2" />
                      Novo Mapa Mental
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cornellNotes.slice(0, 5).map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{note.title}</p>
                      <p className="text-sm text-muted-foreground">{note.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: { low: 1, medium: 2, high: 3, critical: 4 }[note.priority] }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current text-primary" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
