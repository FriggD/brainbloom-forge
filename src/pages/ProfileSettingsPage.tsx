import { User, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UserProfile {
  name: string;
  nickname: string;
  profession: string;
  university: string;
  course: string;
  avatarSeed: string;
}

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    nickname: '',
    profession: '',
    university: '',
    course: '',
    avatarSeed: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      setProfile(JSON.parse(saved));
    } else {
      // Generate random seed for avatar
      setProfile(prev => ({ ...prev, avatarSeed: crypto.randomUUID() }));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    toast.success('Perfil atualizado com sucesso!');
    window.dispatchEvent(new Event('profileUpdated'));
  };

  const regenerateAvatar = () => {
    setProfile({ ...profile, avatarSeed: crypto.randomUUID() });
    toast.success('Avatar regenerado!');
  };

  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.avatarSeed}`;

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/settings')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <User className="w-8 h-8" />
            Perfil
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas informações pessoais
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full border-2 border-primary"
              />
              <div className="flex-1">
                <Label>Avatar</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Gerado automaticamente com base no seu perfil
                </p>
                <Button variant="outline" size="sm" onClick={regenerateAvatar}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Novo Avatar
                </Button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname">Apelido</Label>
              <Input
                id="nickname"
                value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                placeholder="Ex: Frigg"
              />
              <p className="text-xs text-muted-foreground">
                Será exibido na tela inicial e no menu lateral
              </p>
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <Label htmlFor="profession">Profissão</Label>
              <Input
                id="profession"
                value={profile.profession}
                onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                placeholder="Ex: Desenvolvedor"
              />
            </div>

            {/* University */}
            <div className="space-y-2">
              <Label htmlFor="university">Faculdade/Universidade</Label>
              <Input
                id="university"
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                placeholder="Ex: USP"
              />
            </div>

            {/* Course */}
            <div className="space-y-2">
              <Label htmlFor="course">Curso</Label>
              <Input
                id="course"
                value={profile.course}
                onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                placeholder="Ex: Ciência da Computação"
              />
              <p className="text-xs text-muted-foreground">
                Será exibido no menu lateral (tem prioridade sobre profissão)
              </p>
            </div>

            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Perfil
            </Button>
            <Button onClick={() => navigate('/settings')} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileSettingsPage;
