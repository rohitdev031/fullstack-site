import { Search, FileText, Image as ImageIcon, FileArchive, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFiles } from '@/features/files/hooks/useFiles';
import type { AetherFile } from '@/services/fileService';

interface FileSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: AetherFile) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return { Icon: ImageIcon, color: 'text-purple-500' };
  if (mimeType.includes('zip') || mimeType.includes('archive')) return { Icon: FileArchive, color: 'text-yellow-500' };
  if (mimeType.includes('word') || mimeType.includes('document')) return { Icon: FileText, color: 'text-blue-500' };
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return { Icon: FileText, color: 'text-green-500' };
  return { Icon: FileText, color: 'text-red-500' };
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function FileSelectorModal({ isOpen, onClose, onSelect }: FileSelectorModalProps) {
  const { files, isLoading, searchQuery, setSearchQuery } = useFiles('all');

  if (!isOpen) return null;

  // Filter out files that are still uploading or failed
  const readyFiles = files.filter(f => f.status === 'ready');

  return (
    <div className="fixed inset-0 z-100 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-150 h-[80vh] rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 pb-4 border-b border-border/60 shrink-0 bg-muted/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Select File</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/60 bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm font-medium placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-muted/10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary/40" />
              <p className="font-medium text-sm">Loading files...</p>
            </div>
          ) : readyFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">No files found.</p>
              <p className="text-sm mt-1 opacity-70">Upload files from the Files tab to use them here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {readyFiles.map((file) => {
                const { Icon, color } = getFileIcon(file.mimeType);
                return (
                  <button
                    key={file.id}
                    onClick={() => {
                      onSelect(file);
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors text-left group"
                  >
                    <div className="p-2.5 rounded-lg bg-background border border-border/40 group-hover:border-border/80 shadow-sm shrink-0">
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-sm truncate">{file.name}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{formatBytes(file.sizeBytes)}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                        <span className="truncate">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
