import { useState } from 'react';
import { FileText, MoreVertical, Star, Download, Trash, Image as ImageIcon, FileArchive, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AetherFile } from '@/services/files/fileService';

interface FileCardProps {
  file: AetherFile;
  onDelete: (id: string) => Promise<void>;
  onToggleStar: (id: string) => Promise<void>;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileIcon(mimeType?: string) {
  const safeMime = mimeType || '';
  if (safeMime.startsWith('image/')) return { Icon: ImageIcon, color: 'text-purple-500' };
  if (safeMime.includes('zip') || safeMime.includes('archive')) return { Icon: FileArchive, color: 'text-yellow-500' };
  if (safeMime.includes('word') || safeMime.includes('document')) return { Icon: FileText, color: 'text-blue-500' };
  if (safeMime.includes('spreadsheet') || safeMime.includes('excel')) return { Icon: FileText, color: 'text-green-500' };
  return { Icon: FileText, color: 'text-red-500' };
}

export function FileCard({ file, onDelete, onToggleStar }: FileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { Icon, color } = getFileIcon(file.mimeType);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${file.name}? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await onDelete(file.id);
      } catch {
        setIsDeleting(false);
      }
    }
  };

  const handleDownload = () => {
    // Mock download behavior
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('Mock file content'));
    element.setAttribute('download', file.name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow group cursor-pointer rounded-xl relative overflow-hidden">
      {file.status === 'uploading' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${file.uploadProgress || 0}%` }} />
        </div>
      )}
      
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className={`p-3 rounded-xl bg-muted group-hover:bg-background transition-colors shrink-0 relative`}>
            <Icon className={`w-5 h-5 ${color} ${file.status === 'uploading' ? 'opacity-50' : ''}`} />
            {file.status === 'uploading' && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm group-hover:text-primary transition-colors truncate">
                {file.name}
              </span>
              {file.isStarred && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
            </div>
            
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-1 min-w-0">
              <span className="shrink-0">{formatBytes(file.sizeBytes)}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0"></span>
              <span className="truncate min-w-0">{(file.mimeType || '').split('/').pop()?.toUpperCase() || 'FILE'}</span>
              
              {file.status === 'ready' && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40 hidden md:block shrink-0"></span>
                  <span className="hidden md:block truncate">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                </>
              )}
              
              {file.status === 'uploading' && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0"></span>
                  <span className="text-primary">Uploading {file.uploadProgress}%</span>
                </>
              )}

              {file.status === 'failed' && (
                <>
                  <span className="w-1 h-1 rounded-full bg-destructive/40 shrink-0"></span>
                  <span className="text-destructive">Failed</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-60 group-hover:opacity-100 rounded-full hover:bg-muted shrink-0" disabled={file.status === 'uploading' || isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md border-border/60">
            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={handleDownload}>
              <Download className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Download</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => onToggleStar(file.id)}>
              <Star className={`w-4 h-4 ${file.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
              <span className="font-medium">{file.isStarred ? 'Remove Star' : 'Add Star'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" className="gap-3 cursor-pointer py-2.5" onClick={(e: React.MouseEvent) => { e.preventDefault(); handleDelete(); }}>
              <Trash className="w-4 h-4" />
              <span className="font-medium">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

