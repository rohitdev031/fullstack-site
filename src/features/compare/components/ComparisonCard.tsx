import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ThumbsUp, ThumbsDown, ChevronDown, Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { compareService } from '@/services/compareService';

interface ComparisonCardProps {
  model: string;
  icon: ReactNode;
  match: string;
  matchColor: string;
  content: ReactNode;
  sources: { title: string; url: string; snippet?: string }[];
}

export function ComparisonCard({ model, icon, match, matchColor, content, sources }: ComparisonCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    // In a real app we'd get the raw text content, but here we can just do a simple copy
    // since content is a ReactNode we'd typically pass a raw text string for copying
    navigator.clipboard.writeText(`Response from ${model}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRate = async (type: 'up' | 'down') => {
    const newRating = rating === type ? null : type;
    setRating(newRating);
    
    if (newRating) {
      await compareService.rateComparison(model, newRating);
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-sm border-border/50 rounded-2xl hover:shadow-md transition-all duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            {icon}
            <span className="font-bold text-[15px]">{model}</span>
            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 ${matchColor}`}>
              {match}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg hover:bg-muted/50 -mr-2">
            <span className="flex flex-col gap-0.5 items-center justify-center">
              <span className="w-1 h-1 bg-current rounded-full"></span>
              <span className="w-1 h-1 bg-current rounded-full"></span>
              <span className="w-1 h-1 bg-current rounded-full"></span>
            </span>
          </Button>
        </div>

        {/* Card Body */}
        <div className="flex-1 text-[15px] leading-loose text-muted-foreground prose-ol:text-foreground prose-p:leading-loose">
          {content}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-5 mt-6 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Button onClick={handleCopy} variant="ghost" size="icon" className={`h-9 w-9 rounded-lg transition-colors ${isCopied ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-500' : 'text-muted-foreground hover:bg-muted/50'}`}>
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button onClick={() => handleRate('up')} variant="ghost" size="icon" className={`h-9 w-9 rounded-lg transition-colors ${rating === 'up' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted/50'}`}>
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button onClick={() => handleRate('down')} variant="ghost" size="icon" className={`h-9 w-9 rounded-lg transition-colors ${rating === 'down' ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:bg-muted/50'}`}>
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs px-3 font-semibold rounded-lg border-border/60 shadow-xs gap-1.5 hover:bg-muted/50">
            Sources ({sources?.length || 0}) <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
