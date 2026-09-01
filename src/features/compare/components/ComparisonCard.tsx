import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface ComparisonCardProps {
  model: string;
  icon: ReactNode;
  match: string;
  matchColor: string;
  content: ReactNode;
  sources: number;
}

export function ComparisonCard({ model, icon, match, matchColor, content, sources }: ComparisonCardProps) {
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
        <div className="flex-1 text-[13px] leading-relaxed text-muted-foreground prose-ol:text-foreground">
          {content}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-5 mt-6 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/50"><Copy className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/50"><ThumbsUp className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/50"><ThumbsDown className="w-4 h-4" /></Button>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-lg border-border/60 shadow-xs gap-1.5 hover:bg-muted/50">
            Sources ({sources}) <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
