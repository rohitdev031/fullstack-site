import { Search, Loader2, MessageSquare, FileText } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useState, useRef, useEffect } from 'react';

export function SearchBar() {
  const { query, setQuery, results, isSearching } = useSearch();
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl z-50">
       <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
       <input 
         type="text" 
         placeholder="Search conversations..." 
         value={query}
         onChange={(e) => setQuery(e.target.value)}
         onFocus={() => setIsFocused(true)}
         className="w-full h-10 pl-10 pr-10 bg-muted/40 hover:bg-muted/60 transition-colors border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
       />
       {isSearching && (
         <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
           <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
         </div>
       )}

       {/* Dropdown Results */}
       {isFocused && (query.trim().length > 0) && (
         <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/60 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
           {results.length === 0 && !isSearching ? (
             <div className="p-6 text-center text-sm text-muted-foreground">
               No results found for "<span className="font-medium text-foreground">{query}</span>"
             </div>
           ) : (
             <div className="py-2">
               {results.map((result) => (
                 <div key={result.id} className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                   <div className={`p-2 rounded-lg shrink-0 ${result.type === 'conversation' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
                     {result.type === 'conversation' ? <MessageSquare className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                   </div>
                   <div className="flex flex-col flex-1 overflow-hidden">
                     <span className="text-[13px] font-semibold text-foreground truncate">{result.title}</span>
                     <span className="text-[11px] font-medium text-muted-foreground">{result.date}</span>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       )}
    </div>
  );
}
