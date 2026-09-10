import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function FilesToolbar({ searchQuery, onSearchChange }: FilesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search files by name..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/60 bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm font-medium placeholder:text-muted-foreground/60"
        />
      </div>
      <Button variant="outline" className="gap-2 h-11 rounded-xl shadow-sm bg-background hidden sm:flex">
        <Filter className="w-4 h-4" /> Filter
      </Button>
    </div>
  );
}
