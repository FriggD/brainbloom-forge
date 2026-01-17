import { Palette, Check, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const themes = [
  { id: 'light', name: 'Claro', preview: 'bg-white border-2' },
  { id: 'dark', name: 'Escuro', preview: 'bg-slate-950 border-2' },
  { id: 'orquidea', name: 'Orquídea', preview: 'bg-gradient-to-br from-[#dd5e98] to-[#e16f7c]' },
  { id: 'sapphira', name: 'Sapphira', preview: 'bg-[#0353a4]' },
  { id: 'bubblegum', name: 'Bubblegum', preview: 'bg-[#ec5766]' },
];

const ThemeSettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/settings')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Palette className="w-8 h-8" />
            Temas
          </h1>
          <p className="text-muted-foreground mt-1">
            Escolha um tema para personalizar a aparência do sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecione um Tema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:scale-105',
                    theme === t.id ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn('w-20 h-20 rounded-lg shadow-md', t.preview)} />
                  <span className="text-sm font-medium">{t.name}</span>
                  {theme === t.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ThemeSettingsPage;
