import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FolderOpen, 
  FileText, 
  Network, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Home,
  Settings,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudy } from '@/contexts/StudyContext';
import { cn } from '@/lib/utils';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { GlobalSearchDialog } from '@/components/search/GlobalSearchDialog';

export const Sidebar = () => {
  const location = useLocation();
  const { folders, setSelectedFolderId, selectedFolderId } = useStudy();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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

  const rootFolders = folders.filter((f) => !f.parentId);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: FileText, label: 'Método Cornell', path: '/cornell' },
    { icon: Network, label: 'Mind Mapping', path: '/mindmap' },
  ];

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">📚 StudyHub</h1>
      </div>

      {/* Search Button */}
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

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1 mb-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

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
              <div
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors',
                  selectedFolderId === folder.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="p-0.5 hover:bg-sidebar-border rounded"
                >
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                <FolderOpen className="w-4 h-4 text-primary" />
                <span
                  onClick={() => setSelectedFolderId(folder.id)}
                  className="flex-1"
                >
                  {folder.name}
                </span>
              </div>
              {expandedFolders.has(folder.id) && (
                <div className="ml-4 mt-1 space-y-1">
                  {getSubfolders(folder.id).map((subfolder) => (
                    <div
                      key={subfolder.id}
                      onClick={() => setSelectedFolderId(subfolder.id)}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors',
                        selectedFolderId === subfolder.id
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <FolderOpen className="w-4 h-4 text-primary/70" />
                      {subfolder.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configurações
        </Link>
      </div>

      <CreateFolderDialog open={showCreateFolder} onOpenChange={setShowCreateFolder} />
      <GlobalSearchDialog open={showSearch} onOpenChange={setShowSearch} />
    </aside>
  );
};
