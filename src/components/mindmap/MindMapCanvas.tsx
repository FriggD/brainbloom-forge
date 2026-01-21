import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, ZoomIn, ZoomOut, Maximize2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MindMapNode, MindMap } from '@/types/study';
import { cn } from '@/lib/utils';
import { useAutoSave } from '@/hooks/useAutoSave';

interface MindMapCanvasProps {
  mindMap?: MindMap;
  onSave: (mindMap: MindMap) => void;
  onAutoSave?: (mindMap: MindMap) => void;
}

const nodeColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const MindMapCanvas = ({ mindMap, onSave, onAutoSave }: MindMapCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(mindMap?.title || '');
  const [nodes, setNodes] = useState<MindMapNode[]>(
    mindMap?.nodes || [
      { id: 'central', text: 'Conceito Central', x: 600, y: 400, color: nodeColors[0] },
    ]
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasManualSave, setHasManualSave] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [zoom, setZoom] = useState(1);
  const mindMapIdRef = useRef(mindMap?.id || crypto.randomUUID());

  const handleAddNode = (parentId?: string) => {
    const parent = parentId ? nodes.find((n) => n.id === parentId) : nodes[0];
    if (!parent) return;

    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 50;

    const newNode: MindMapNode = {
      id: crypto.randomUUID(),
      text: 'Novo conceito',
      x: parent.x + Math.cos(angle) * distance,
      y: parent.y + Math.sin(angle) * distance,
      parentId: parent.id,
      color: nodeColors[nodes.length % nodeColors.length],
    };

    setNodes((prev) => [...prev, newNode]);
    setEditingNode(newNode.id);
  };

  const handleUpdateNodeText = (id: string, text: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const handleDeleteNode = (id: string) => {
    if (id === 'central') return;
    setNodes((prev) => prev.filter((n) => n.id !== id && n.parentId !== id));
    setSelectedNode(null);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (editingNode === nodeId) return;
    
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggedNode(nodeId);
    setDragOffset({
      x: (e.clientX - rect.left) / zoom - node.x,
      y: (e.clientY - rect.top) / zoom - node.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = (e.clientX - rect.left) / zoom - dragOffset.x;
    const newY = (e.clientY - rect.top) / zoom - dragOffset.y;

    // Auto-expand canvas if node is near edges
    const padding = 100;
    if (newX > canvasSize.width - padding) {
      setCanvasSize(prev => ({ ...prev, width: prev.width + 200 }));
    }
    if (newY > canvasSize.height - padding) {
      setCanvasSize(prev => ({ ...prev, height: prev.height + 200 }));
    }

    setNodes((prev) =>
      prev.map((n) => (n.id === draggedNode ? { ...n, x: Math.max(50, newX), y: Math.max(50, newY) } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const expandCanvas = () => {
    setCanvasSize(prev => ({
      width: prev.width + 400,
      height: prev.height + 300
    }));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const buildMapData = useCallback(() => {
    const now = new Date().toISOString();
    
    // Generate auto-save title if empty
    const finalTitle = title.trim() || (() => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `auto-save[${day}-${month}/${hours}:${minutes}]`;
    })();
    
    return {
      id: mindMapIdRef.current,
      title: finalTitle,
      centralConcept: nodes[0]?.text || '',
      nodes,
      tags: mindMap?.tags || [],
      priority: mindMap?.priority || 'medium',
      folderId: mindMap?.folderId,
      createdAt: mindMap?.createdAt || now,
      updatedAt: now,
    };
  }, [title, nodes, mindMap]);

  const handleSave = useCallback(() => {
    const mapData = buildMapData();
    onSave(mapData);
    setHasManualSave(true);
    setTimeout(() => setHasManualSave(false), 2000);
  }, [buildMapData, onSave]);

  const handleAutoSave = useCallback(() => {
    const mapData = buildMapData();
    
    if (onAutoSave) {
      onAutoSave(mapData);
    } else {
      onSave(mapData);
    }
  }, [buildMapData, onSave, onAutoSave]);

  // Auto-save with debounce
  const { isSaving } = useAutoSave({ title, nodes }, {
    delay: 2000,
    onSave: handleAutoSave,
    enabled: true,
  });

  const drawConnections = () => {
    return nodes
      .filter((node) => node.parentId)
      .map((node) => {
        const parent = nodes.find((n) => n.id === node.parentId);
        if (!parent) return null;

        return (
          <line
            key={`line-${node.id}`}
            x1={parent.x}
            y1={parent.y}
            x2={node.x}
            y2={node.y}
            stroke="hsl(var(--border))"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        );
      });
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do Mapa Mental"
          className="max-w-md text-lg font-semibold"
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {isSaving && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            )}
            {hasManualSave && (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Salvo!</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={expandCanvas} title="Expandir canvas">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => handleAddNode(selectedNode || undefined)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Nó
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Canvas with scroll */}
      <Card className="flex-1 relative overflow-auto bg-card">
        <div
          ref={canvasRef}
          className="relative cursor-crosshair"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            minWidth: '100%',
            minHeight: '100%',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg 
            className="absolute inset-0 pointer-events-none"
            style={{ width: canvasSize.width, height: canvasSize.height }}
          >
            {drawConnections()}
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2 transition-shadow',
                'rounded-xl px-4 py-2 min-w-[100px] text-center cursor-move shadow-md',
                selectedNode === node.id && 'ring-2 ring-ring ring-offset-2',
                node.id === 'central' && 'min-w-[140px] py-3'
              )}
              style={{
                left: node.x,
                top: node.y,
                backgroundColor: node.color,
                color: 'white',
              }}
              onClick={() => setSelectedNode(node.id)}
              onDoubleClick={() => setEditingNode(node.id)}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
            >
              {editingNode === node.id ? (
                <input
                  type="text"
                  value={node.text}
                  onChange={(e) => handleUpdateNodeText(node.id, e.target.value)}
                  onBlur={() => setEditingNode(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingNode(null)}
                  className="bg-transparent border-none text-center w-full outline-none text-inherit"
                  autoFocus
                />
              ) : (
                <span className={cn('font-medium', node.id === 'central' && 'text-lg')}>
                  {node.text}
                </span>
              )}

              {selectedNode === node.id && node.id !== 'central' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(node.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 text-sm text-muted-foreground bg-background/80 px-3 py-2 rounded-lg">
            <p>💡 Duplo clique para editar • Arraste para mover • Use scroll para navegar • Clique em expandir para mais espaço</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
