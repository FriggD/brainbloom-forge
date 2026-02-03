import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  FileText, 
  Network, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Home,
  Settings,
  Search,
  Layers,
  Menu,
  X,
  Calendar,
  BookOpen,
  LogOut,
  BookA,
  Pencil,
  Check,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useStudy } from '@/contexts/StudyContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { GlobalSearchDialog } from '@/components/search/GlobalSearchDialog';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { folders, setSelectedFolderId, selectedFolderId, updateFolder } = useStudy();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [profile, setProfile] = useState({ nickname: 'StudyHub', course: '', profession: '', avatarSeed: '' });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [colorPopoverOpen, setColorPopoverOpen] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      const data = JSON.parse(saved);
      setProfile({
        nickname: data.nickname || 'StudyHub',
        course: data.course || '',
        profession: data.profession || '',
        avatarSeed: data.avatarSeed || ''
      });
    }

    const handleProfileUpdate = () => {
      const updated = localStorage.getItem('userProfile');
      if (updated) {
        const data = JSON.parse(updated);
        setProfile({
          nickname: data.nickname || 'StudyHub',
          course: data.course || '',
          profession: data.profession || '',
          avatarSeed: data.avatarSeed || ''
        });
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't collapse if a color popover is open
      if (colorPopoverOpen) return;
      
      const target = event.target as Node;
      // Don't collapse if clicking inside a popover or radix portal
      const isInsidePopover = (target as Element)?.closest?.('[data-radix-popper-content-wrapper]') ||
                              (target as Element)?.closest?.('[role="dialog"]');
      if (!isCollapsed && sidebarRef.current && !sidebarRef.current.contains(target) && !isInsidePopover) {
        setIsCollapsed(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollapsed, colorPopoverOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const startEditingFolder = (e: React.MouseEvent, folderId: string, currentName: string) => {
    e.stopPropagation();
    setEditingFolderId(folderId);
    setEditingFolderName(currentName);
  };

  const saveEditingFolder = async () => {
    if (editingFolderId && editingFolderName.trim()) {
      await updateFolder(editingFolderId, { name: editingFolderName.trim() });
    }
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const updateFolderColor = async (folderId: string, color: string) => {
    await updateFolder(folderId, { color });
  };

  const cancelEditingFolder = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const rootFolders = folders.filter((f) => !f.parentId);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: FileText, label: 'Método Cornell', path: '/cornell' },
    { icon: Network, label: 'Mind Mapping', path: '/mindmap' },
    { icon: Layers, label: 'Flashcards', path: '/flashcards' },
    { icon: BookA, label: 'Glossário', path: '/glossary' },
    { icon: Calendar, label: 'Calendário', path: '/calendar' },
    { icon: BookOpen, label: 'Hub de Conteúdo', path: '/content-hub' },
  ];

  const avatarUrl = profile.avatarSeed 
    ? `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.avatarSeed}`
    : null;
  const subtitle = profile.course || profile.profession;

  const folderColors = [
    { name: 'Padrão', value: '' },
    { name: 'Vermelho', value: 'hsl(0, 72%, 51%)' },
    { name: 'Laranja', value: 'hsl(25, 95%, 53%)' },
    { name: 'Âmbar', value: 'hsl(45, 93%, 47%)' },
    { name: 'Verde', value: 'hsl(142, 71%, 45%)' },
    { name: 'Esmeralda', value: 'hsl(160, 84%, 39%)' },
    { name: 'Ciano', value: 'hsl(187, 85%, 43%)' },
    { name: 'Azul', value: 'hsl(217, 91%, 60%)' },
    { name: 'Índigo', value: 'hsl(239, 84%, 67%)' },
    { name: 'Violeta', value: 'hsl(258, 90%, 66%)' },
    { name: 'Rosa', value: 'hsl(330, 81%, 60%)' },
  ];

  const renderFolderItem = (folder: { id: string; name: string; color?: string }, isSubfolder: boolean = false) => {
    const isEditing = editingFolderId === folder.id;
    const folderColor = folder.color || undefined;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 px-2 py-1">
          <Input
            value={editingFolderName}
            onChange={(e) => setEditingFolderName(e.target.value)}
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEditingFolder();
              if (e.key === 'Escape') cancelEditingFolder();
            }}
            onBlur={saveEditingFolder}
          />
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={saveEditingFolder}>
            <Check className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors group',
          selectedFolderId === folder.id
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
        )}
      >
        {!isSubfolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
            className="p-0.5 hover:bg-sidebar-border rounded"
          >
            {expandedFolders.has(folder.id) ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}
        <FolderOpen 
          className="w-4 h-4" 
          style={{ color: folderColor || (isSubfolder ? 'hsl(var(--primary) / 0.7)' : 'hsl(var(--primary))') }}
        />
        <span
          onClick={() => {
            setSelectedFolderId(folder.id);
            navigate(`/folder/${folder.id}`);
          }}
          className="flex-1 truncate"
          style={{ color: folderColor }}
        >
          {folder.name}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover 
            modal={false} 
            open={colorPopoverOpen === folder.id}
            onOpenChange={(open) => setColorPopoverOpen(open ? folder.id : null)}
          >
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-sidebar-border rounded"
              >
                <Palette className="w-3 h-3" style={{ color: folderColor }} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start" side="right" sideOffset={8}>
              <div className="flex flex-wrap gap-1.5 max-w-[160px]">
                {folderColors.map((c) => (
                  <button
                    key={c.value || 'default'}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFolderColor(folder.id, c.value);
                      setColorPopoverOpen(null);
                    }}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                      folder.color === c.value ? 'border-foreground' : 'border-transparent'
                    )}
                    style={{ 
                      backgroundColor: c.value || 'hsl(var(--primary))',
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button
            onClick={(e) => startEditingFolder(e, folder.id, folder.name)}
            className="p-1 hover:bg-sidebar-border rounded"
          >
            <Pencil className="w-3 h-3" style={{ color: folderColor }} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <aside ref={sidebarRef} className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <span className="text-2xl">📚</span>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-sidebar-foreground truncate">{profile.nickname}</h1>
                {subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 shrink-0"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Search Button */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground bg-muted/50 hover:bg-muted transition-colors border border-border"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 text-xs">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1 mb-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsCollapsed(true)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <item.icon className="w-4 h-4" />
              {!isCollapsed && item.label}
            </Link>
          ))}
        </div>

        {!isCollapsed && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pastas
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCreateFolder(true)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-1">
              {rootFolders.map((folder) => (
                <div key={folder.id}>
                  {renderFolderItem(folder)}
                  {expandedFolders.has(folder.id) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {getSubfolders(folder.id).map((subfolder) => (
                        <div key={subfolder.id}>
                          {renderFolderItem(subfolder, true)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="space-y-1">
            {rootFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolderId(folder.id);
                  navigate(`/folder/${folder.id}`);
                }}
                className={cn(
                  'w-full flex items-center justify-center px-2 py-2 rounded-lg transition-colors',
                  selectedFolderId === folder.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <FolderOpen className="w-4 h-4" style={{ color: folder.color || 'hsl(var(--primary))' }} />
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          to="/settings"
          onClick={() => setIsCollapsed(true)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Settings className="w-4 h-4" />
          {!isCollapsed && 'Configurações'}
        </Link>
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && 'Sair'}
        </button>
      </div>

      <CreateFolderDialog open={showCreateFolder} onOpenChange={setShowCreateFolder} />
      <GlobalSearchDialog open={showSearch} onOpenChange={setShowSearch} />
    </aside>
  );
};
