import { Sparkles, Copy, RotateCcw, ThumbsUp, ThumbsDown, MoreHorizontal, Target, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type Message } from '../types';

type ChatMessageCardProps = {
  message: Message;
  currentModel: string;
};

export function ChatMessageCard({ message, currentModel }: ChatMessageCardProps) {
  if (message.role === 'user') {
    return (
      <div className="bg-foreground text-background px-6 py-4 rounded-3xl rounded-tr-sm max-w-[85%] md:max-w-[75%] shadow-sm mt-4">
        <p className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">{message.content}</p>
      </div>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden w-full">
      <div className="p-4 px-6 bg-muted/20 border-b border-border/50 flex items-center gap-3">
        <Avatar className="w-7 h-7 bg-indigo-100 text-indigo-600 shrink-0">
          <Sparkles className="w-4 h-4" />
        </Avatar>
        <span className="font-bold text-sm">Response</span>
        <span className="text-xs font-medium text-muted-foreground border-l border-border/60 pl-3 ml-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" /> {currentModel}
        </span>
        <span className="text-xs font-medium text-muted-foreground border-l border-border/60 pl-3 ml-1">
          Today, 10:24 AM
        </span>
      </div>
      <CardContent className="p-6 md:p-8 text-[15px] leading-loose space-y-4">
        {message.isLoading ? (
          <div className="flex items-center gap-2 text-primary h-6">
            <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce delay-75"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce delay-150"></span>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap prose prose-slate dark:prose-invert max-w-none prose-p:leading-loose">
              {message.content}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 mt-4 border-t border-border/50">
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-lg font-semibold border-border/60 shadow-xs"><Copy className="w-3.5 h-3.5 mr-2" /> Copy</Button>
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-lg font-semibold border-border/60 shadow-xs"><RotateCcw className="w-3.5 h-3.5 mr-2" /> Regenerate</Button>
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-lg font-semibold border-border/60 shadow-xs"><Sparkles className="w-3.5 h-3.5 mr-2" /> Improve Answer</Button>

              <div className="ml-auto flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><ThumbsUp className="w-4 h-4 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><ThumbsDown className="w-4 h-4 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></Button>
              </div>
            </div>

            {/* Sources */}
            <div className="flex items-center justify-between pt-5 mt-5 border-t border-border/50 cursor-pointer group">
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-bold text-foreground">Sources (5)</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0077b5]/10 flex items-center justify-center"><span className="text-[11px] font-bold text-[#0077b5]">in</span></div>
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><span className="text-[11px] font-bold">W</span></div>
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Target className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                  <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center"><span className="text-[11px] font-bold">in</span></div>
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><span className="text-[11px] font-bold text-muted-foreground">+2</span></div>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
