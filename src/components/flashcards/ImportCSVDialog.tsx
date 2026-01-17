import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (csvContent: string) => Promise<void>;
}

export const ImportCSVDialog = ({
  open,
  onOpenChange,
  onImport,
}: ImportCSVDialogProps) => {
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!csvContent.trim()) return;
    setLoading(true);
    await onImport(csvContent);
    setLoading(false);
    setCsvContent('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Flashcards de CSV</DialogTitle>
          <DialogDescription>
            Formato: primeira coluna = frente, segunda coluna = verso, separados por vírgula.
            Campos com vírgulas devem estar entre aspas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Upload de Arquivo CSV</Label>
            <input
              type="file"
              accept=".csv,.txt"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Arquivo
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv">Ou cole o conteúdo CSV</Label>
            <Textarea
              id="csv"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={`Qual osso do carpo está ausente na maioria dos equinos?,O osso trapézio.
"O que é a fibrocartilagem parapatelar?","É uma estrutura que prolonga a patela."`}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <strong>Exemplo:</strong>
            <pre className="mt-1 whitespace-pre-wrap text-xs">
{`Pergunta 1,Resposta 1
"Pergunta com vírgula, aqui","Resposta com vírgula, aqui"`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!csvContent.trim() || loading}>
            {loading ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
