import { HardDrive, Clock, Star, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FileFilter } from '@/services/fileService';

interface FilesSidebarProps {
  currentFilter: FileFilter;
  onFilterChange: (filter: FileFilter) => void;
}

export function FilesSidebar({ currentFilter, onFilterChange }: FilesSidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-64 gap-6 shrink-0">
      <h1 className="text-2xl font-bold mb-2">Files</h1>
      
      <nav className="flex flex-col gap-1">
        <Button 
          variant={currentFilter === 'all' ? 'secondary' : 'ghost'} 
          className={`justify-start gap-3 font-semibold rounded-xl h-11 ${currentFilter === 'all' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => onFilterChange('all')}
        >
          <HardDrive className="w-4 h-4" /> My Files
        </Button>
        <Button 
          variant={currentFilter === 'recent' ? 'secondary' : 'ghost'} 
          className={`justify-start gap-3 font-semibold rounded-xl h-11 ${currentFilter === 'recent' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => onFilterChange('recent')}
        >
          <Clock className="w-4 h-4" /> Recent
        </Button>
        <Button 
          variant={currentFilter === 'starred' ? 'secondary' : 'ghost'} 
          className={`justify-start gap-3 font-semibold rounded-xl h-11 ${currentFilter === 'starred' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => onFilterChange('starred')}
        >
          <Star className="w-4 h-4" /> Starred
        </Button>
        <Button 
          variant={currentFilter === 'shared' ? 'secondary' : 'ghost'} 
          className={`justify-start gap-3 font-semibold rounded-xl h-11 ${currentFilter === 'shared' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => onFilterChange('shared')}
        >
          <Folder className="w-4 h-4" /> Shared with me
        </Button>
      </nav>

      <div className="mt-auto pt-6 border-t border-border/50">
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="font-semibold text-muted-foreground">Storage</span>
          <span className="font-bold">45.5 GB / 100 GB</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[45%] rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
