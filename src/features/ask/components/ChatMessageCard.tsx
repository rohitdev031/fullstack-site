import { useState } from 'react';
import { Sparkles, Copy, RotateCcw, ThumbsUp, ThumbsDown, MoreHorizontal, Target, ChevronDown, ChevronUp, Check, Link, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { chatService } from '@/services/chatService';
import { type Message } from '../types';
import { useNavigate } from 'react-router-dom';

type ChatMessageCardProps = {
  message: Message;
  currentModel: string;
  onRegenerate: (messageId: string, type: 'standard' | 'improve') => void;
};

export function ChatMessageCard({ message, currentModel, onRegenerate }: ChatMessageCardProps) {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRate = async (type: 'up' | 'down') => {
    // If they click the same button again, un-rate it. Otherwise, set it.
    const newRating = rating === type ? null : type;
    setRating(newRating);

    // In a real app, you might pass 'none' or null to remove the rating.
    if (newRating) {
      await chatService.rateMessage(message.id, newRating);
    }
  };

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
            <div className="flex flex-wrap items-center gap-3 pt-6 mt-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className={`h-9 text-xs rounded-lg font-semibold border-border/60 shadow-xs transition-colors ${isCopied ? ['bg-green-50', 'dark:bg-green-900/20', 'text-green-600', 'border-green-200', 'dark:border-green-800'].join(' ') : ''}`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
              <Button onClick={() => onRegenerate(message.id, 'standard')} variant="outline" size="sm" className="h-9 text-xs rounded-lg font-semibold border-border/60 shadow-xs"><RotateCcw className="w-3.5 h-3.5 mr-2" /> Regenerate</Button>
              <Button onClick={() => onRegenerate(message.id, 'improve')} variant="outline" size="sm" className="h-9 text-xs rounded-lg font-semibold border-border/60 shadow-xs"><Sparkles className="w-3.5 h-3.5 mr-2" /> Improve Answer</Button>
              <Button onClick={() => navigate('/verify', { state: { answerToVerify: message.content } })} variant="outline" size="sm" className="h-9 text-xs rounded-lg font-semibold border-border/60 shadow-xs hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"><ShieldCheck className="w-3.5 h-3.5 mr-2" /> Verify</Button>

              <div className="ml-auto flex items-center gap-1.5">
                <Button onClick={() => handleRate('up')} variant="ghost" size="icon" className={`h-9 w-9 rounded-lg transition-colors ${rating === 'up' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}><ThumbsUp className="w-4 h-4" /></Button>
                <Button onClick={() => handleRate('down')} variant="ghost" size="icon" className={`h-9 w-9 rounded-lg transition-colors ${rating === 'down' ? 'text-destructive bg-destructive/10' : 'text-muted-foreground'}`}><ThumbsDown className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></Button>
              </div>
            </div>

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="pt-5 mt-5 border-t border-border/50">
                <div
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center justify-between cursor-pointer group select-none"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">Sources ({message.sources.length})</span>
                    <div className="flex items-center gap-2">
                      {/* Just show a generic icon for the sources summary if we want, or map the first 3 */}
                      <div className={['w-7 h-7', 'rounded-full', 'bg-blue-100', 'dark:bg-blue-900/30', 'flex items-center justify-center'].join(' ')}><Target className={['w-4 h-4', 'text-blue-600', 'dark:text-blue-400'].join(' ')} /></div>
                    </div>
                  </div>
                  {showSources ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>

                {/* Expandable Sources List */}
                {showSources && (
                  <div className="mt-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                    {message.sources.map((source, i) => (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer transition-colors group/source">
                        <div className={['w-8 h-8', 'rounded-md', 'bg-zinc-100', 'dark:bg-zinc-800', 'flex items-center justify-center shrink-0'].join(' ')}><span className="text-[11px] font-bold">{source.title.charAt(0)}</span></div>
                        <div className="flex flex-col overflow-hidden flex-1">
                          <span className="text-sm font-semibold truncate group-hover/source:text-primary transition-colors">{source.title}</span>
                          <span className="text-xs text-muted-foreground truncate">{source.url}</span>
                        </div>
                        <Link className="w-4 h-4 text-muted-foreground group-hover/source:text-primary shrink-0 opacity-0 group-hover/source:opacity-100 transition-all" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
