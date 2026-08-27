import { X, FileText, Plus, Paperclip, ChevronDown, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ChatComposerProps = {
  prompt: string;
  setPrompt: (p: string) => void;
  attachedFile: string | null;
  setAttachedFile: (f: string | null) => void;
  fileInputRef: React.Ref<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileAccept: string;
  triggerFileInput: (accept: string) => void;
  setIsPreviewOpen: (open: boolean) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSubmit: () => void;
  currentModel: string;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
};

export function ChatComposer({
  prompt,
  setPrompt,
  attachedFile,
  setAttachedFile,
  fileInputRef,
  handleFileChange,
  fileAccept,
  triggerFileInput,
  setIsPreviewOpen,
  handleKeyDown,
  handleSubmit,
  currentModel,
  webSearchEnabled,
  setWebSearchEnabled
}: ChatComposerProps) {
  return (
    <div className="absolute -bottom-4 -left-4 -right-4 md:bottom-0 md:left-0 md:right-0 pt-10 pb-0 md:pb-4 bg-linear-to-t from-background via-background via-70% to-transparent z-40 md:pr-2">
      <div className="relative shadow-sm rounded-none md:rounded-2xl bg-background border-t border-b-0 border-l-0 border-r-0 md:border md:border-border/60 transition-all focus-within:ring-0 md:focus-within:ring-4 focus-within:ring-primary/10 shrink-0 flex flex-col">

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={fileAccept}
          onChange={handleFileChange}
        />

        {/* Attached File Preview */}
        {attachedFile && (
          <div className="pt-4 px-6 md:px-5 pb-0 flex gap-3">
            <div
              className="relative group w-16 h-16 rounded-2xl border border-border/60 bg-muted/30 hover:bg-muted/60 flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm shrink-0"
              onClick={() => setIsPreviewOpen(true)}
            >
              <div
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-border/80 flex items-center justify-center shadow-xs hover:bg-muted cursor-pointer transition-opacity md:opacity-0 md:group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }}
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </div>

              <FileText className="w-6 h-6 text-primary mb-1" />
              <span className="text-[10px] font-bold text-muted-foreground truncate w-full px-2 text-center uppercase tracking-wider">{attachedFile.split('.').pop() || 'FILE'}</span>
            </div>
          </div>
        )}

        <Textarea
          placeholder="Ask anything..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-30 resize-none border-0 shadow-none focus-visible:ring-0 p-4 text-[15px] leading-relaxed font-medium bg-transparent overflow-y-auto scrollbar-hide"
        />

        <div className="absolute bottom-4 left-4 md:left-5 flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/60 shadow-sm text-muted-foreground bg-background hover:bg-muted/50" />}>
              <Plus className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 mb-2 rounded-xl p-1 shadow-md border-border/60">
              <DropdownMenuItem className="gap-3 p-3 rounded-lg cursor-pointer font-medium" onClick={() => triggerFileInput('*/*')}>
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <span>Upload file</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute bottom-5 right-4 md:bottom-4 md:right-4 flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2 mr-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
            <span className="text-xs font-medium truncate max-w-20">{currentModel.split(' ')[0]}</span>
            <Switch checked={webSearchEnabled} onCheckedChange={setWebSearchEnabled} className="scale-75 origin-right -mr-1" />
          </div>
          <Button variant="outline" className="hidden md:flex rounded-xl h-10 px-4 shadow-sm border-border/60 text-sm font-semibold gap-2 bg-background hover:bg-muted/50">
            Auto <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            className={`rounded-xl h-10 w-12 px-0 shadow-sm transition-all ${prompt.trim() || attachedFile ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-muted text-muted-foreground'}`}
            onClick={() => handleSubmit()}
            disabled={!prompt.trim() && !attachedFile}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
