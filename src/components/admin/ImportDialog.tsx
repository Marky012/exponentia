import { useState, useRef } from 'react';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStudentStore } from '@/store/studentStore';
import { toast } from 'sonner';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FileEntry {
  file: File;
  status: 'pending' | 'success' | 'error';
  name: string;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const { importStudents } = useStudentStore();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; updated: number; failed: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const entries: FileEntry[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      entries.push({ file: newFiles[i], status: 'pending', name: newFiles[i].name });
    }
    setFiles(prev => [...prev, ...entries]);
    setResult(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    setImporting(true);
    const parsed: any[] = [];
    const newFiles = [...files];

    for (let i = 0; i < newFiles.length; i++) {
      try {
        const text = await newFiles[i].file.text();
        const data = JSON.parse(text);
        parsed.push(data);
        newFiles[i] = { ...newFiles[i], status: 'success' };
      } catch {
        newFiles[i] = { ...newFiles[i], status: 'error' };
      }
    }

    setFiles(newFiles);
    const res = importStudents(parsed);
    setResult(res);
    setImporting(false);

    if (res.imported + res.updated > 0) {
      toast.success(`Imported: ${res.imported}, Updated: ${res.updated}`);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-orbitron">Import Student Data</DialogTitle>
          <DialogDescription>Upload .json files exported by students. Duplicate names will be updated.</DialogDescription>
        </DialogHeader>

        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Click to select files or drag and drop</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Accepts .json files</p>
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">{f.name}</span>
                {f.status === 'success' && <Check className="w-4 h-4 text-emerald-500" />}
                {f.status === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
                {f.status === 'pending' && (
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {result && (
          <p className="text-sm text-center text-muted-foreground">
            Imported: {result.imported} · Updated: {result.updated}{result.failed > 0 ? ` · Failed: ${result.failed}` : ''}
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>Close</Button>
          <Button onClick={handleImport} disabled={files.length === 0 || importing}>
            {importing ? 'Importing...' : `Import ${files.length} File(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
