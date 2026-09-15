import { Sparkles, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getIcon } from '../iconMap';
import type { ChatSuggestion } from '@/services/chat/chatService';

type AskEmptyStateProps = {
  suggestions: ChatSuggestion[];
  error?: string | null;
  onSuggestionClick: (text: string) => void;
};

export function AskEmptyState({ suggestions, error, onSuggestionClick }: AskEmptyStateProps) {
  return (
    <div className="mt-auto mb-10 shrink-0 animate-in fade-in duration-700 flex flex-col justify-center items-center md:items-start h-full md:h-auto">

      {/* Mobile Graphic (Hidden on Desktop) */}
      <div className="md:hidden flex flex-col items-center justify-center gap-4 text-center mt-[-10vh]">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-600/20 relative">
          <Sparkles className="w-6 h-6 text-indigo-300 absolute -top-2 -right-2" />
          <Sparkles className="w-4 h-4 text-indigo-300 absolute -bottom-1 -left-1" />
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white fill-white"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path><circle cx="8" cy="12" r="1.5" fill="#4f46e5" stroke="none"></circle><circle cx="12" cy="12" r="1.5" fill="#4f46e5" stroke="none"></circle><circle cx="16" cy="12" r="1.5" fill="#4f46e5" stroke="none"></circle></svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight mt-2">Ask anything</h2>
        <p className="text-sm text-muted-foreground font-medium px-8 leading-relaxed">Get quick, accurate answers to any question.</p>
      </div>

      {/* Desktop Suggestions (Hidden on Mobile) */}
      <div className="hidden md:block w-full">
        <p className="text-sm text-muted-foreground mb-4 font-medium pl-1">
          {error || 'Try asking something like'}
        </p>
        <div className="flex gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {suggestions.map((suggestion, i) => {
              const Icon = getIcon(suggestion.iconName);
              return (
                <Card
                  key={i}
                  onClick={() => onSuggestionClick(suggestion.text)}
                  className="hover:border-primary/40 cursor-pointer shadow-sm transition-all group hover:shadow-md h-full rounded-2xl border-border/60"
                >
                  <CardContent className="p-4 flex items-center gap-4 h-full">
                    <div className={`p-2.5 rounded-xl bg-muted/50 ${suggestion.color} group-hover:bg-background transition-colors shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground line-clamp-2 leading-relaxed transition-colors">{suggestion.text}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <Button variant="outline" size="icon" className="shrink-0 h-auto w-14 rounded-2xl shadow-sm border-border/60 hover:bg-muted self-stretch flex items-center justify-center bg-background">
            <RotateCcw className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}

