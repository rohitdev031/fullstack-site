import { FileText, Loader2, SearchX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AetherFile } from '@/services/files/fileService';
import { FileCard } from './FileCard';

interface FilesListProps {
  files: AetherFile[];
  searchQuery: string;
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onToggleStar: (id: string) => Promise<void>;
}

export function FilesList({ files, searchQuery, isLoading, onDelete, onToggleStar }: FilesListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 mt-2">
        <h3 className="font-bold text-lg">Documents</h3>
        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-bold rounded-full">
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1 inline-block" /> : null}
          {files.length} files
        </Badge>
      </div>
      
      <div className="flex flex-col gap-3">
        {isLoading && files.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary/40" />
            <p className="font-medium text-sm">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border/50">
            {searchQuery ? (
              <>
                <SearchX className="w-10 h-10 mb-3 opacity-30 text-primary" />
                <p className="font-medium">No files found matching "{searchQuery}"</p>
                <p className="text-xs mt-1 opacity-70">Try adjusting your search terms or filters.</p>
              </>
            ) : (
              <>
                <FileText className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-medium">No files available.</p>
              </>
            )}
          </div>
        ) : (
          files.map((file) => (
            <FileCard 
              key={file.id} 
              file={file} 
              onDelete={onDelete} 
              onToggleStar={onToggleStar} 
            />
          ))
        )}
      </div>
    </div>
  );
}

