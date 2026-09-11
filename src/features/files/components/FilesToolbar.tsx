import { Search, Filter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface FilesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  fileTypeFilter: string;
  onFileTypeChange: (value: string) => void;
}

export function FilesToolbar({ searchQuery, onSearchChange, fileTypeFilter, onFileTypeChange }: FilesToolbarProps) {
  const filterOptions = [
    { value: 'all', label: 'All Files' },
    { value: 'document', label: 'Documents' },
    { value: 'spreadsheet', label: 'Spreadsheets' },
    { value: 'pdf', label: 'PDFs' },
    { value: 'image', label: 'Images' },
    { value: 'archive', label: 'Archives' },
  ];

  return (
    <div className="shrink-0 flex flex-col sm:flex-row gap-3">
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
      
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" className="gap-2 h-11 rounded-xl shadow-sm bg-background hidden sm:flex min-w-[110px] justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> 
              <span>{filterOptions.find(o => o.value === fileTypeFilter)?.label || 'Filter'}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md border-border/60">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold uppercase tracking-wider py-2">
            File Type
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value}
              className="gap-2 cursor-pointer py-2.5 flex items-center justify-between" 
              onClick={() => onFileTypeChange(option.value)}
            >
              <span className={fileTypeFilter === option.value ? 'font-medium' : ''}>
                {option.label}
              </span>
              {fileTypeFilter === option.value && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
