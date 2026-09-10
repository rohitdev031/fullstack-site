import { Sparkles, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { type ResponseQuality, RESPONSE_QUALITIES, type ModelId, AVAILABLE_MODELS } from '../types';

type AskControlsProps = {
  currentModel: ModelId;
  setCurrentModel: (model: ModelId) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  responseQuality: ResponseQuality;
  setResponseQuality: (quality: ResponseQuality) => void;
};

export function AskControls({ 
  currentModel, 
  setCurrentModel,
  webSearchEnabled, 
  setWebSearchEnabled, 
  responseQuality, 
  setResponseQuality 
}: AskControlsProps) {
  return (
    <div className="flex items-end gap-4 p-4 px-5 rounded-2xl bg-background border border-border/50 shadow-sm w-full shrink-0 mb-6">
      
      {/* Select Model */}
      <div className="flex flex-col gap-2 w-56 shrink-0">
        <span className="text-[11px] font-bold text-muted-foreground pl-1">Select Model</span>
        <Select value={currentModel} onValueChange={(val) => setCurrentModel(val as ModelId)}>
          <SelectTrigger className="flex items-center justify-between w-full h-11 p-2 px-3 bg-background border border-border/60 hover:border-border cursor-pointer transition-colors rounded-lg shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-foreground">
                <SelectValue placeholder="Select a model" />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-px h-8 bg-border/60 mx-1 self-end mb-1.5" />

      {/* Web Search */}
      <div className="flex flex-col gap-2 items-center w-24 shrink-0">
        <span className="text-[11px] font-bold text-muted-foreground">Web Search</span>
        <div className="flex items-center justify-center h-11">
          <Switch checked={webSearchEnabled} onCheckedChange={setWebSearchEnabled} className="data-[state=checked]:bg-indigo-500" />
        </div>
      </div>

      <div className="w-px h-8 bg-border/60 mx-1 self-end mb-1.5" />

      {/* Response Quality */}
      <div className="flex flex-col gap-2 flex-1 max-w-80">
        <span className="text-[11px] font-bold text-muted-foreground pl-1">Response Quality</span>
        <div className="flex items-center border border-border/60 rounded-lg overflow-hidden bg-background p-1 h-11 w-full shadow-xs">
           {RESPONSE_QUALITIES.map((q) => (
             <button 
               key={q}
               onClick={() => setResponseQuality(q)}
               className={`flex-1 h-full text-[13px] font-medium rounded-md transition-all duration-200 ${responseQuality === q ? ['bg-indigo-50/80', 'text-indigo-600', 'dark:bg-indigo-900/30', 'dark:text-indigo-400'].join(' ') : 'text-muted-foreground hover:bg-muted/50'}`}
             >
               {q}
             </button>
           ))}
        </div>
      </div>

      {/* More Settings */}
      <div className="ml-auto flex items-end shrink-0">
        <Button variant="outline" size="sm" className="h-11 px-4 rounded-lg border-border/60 bg-background text-[13px] font-medium gap-2 shadow-xs hover:bg-muted/50 text-muted-foreground">
          More Settings <Settings2 className="w-4 h-4" />
        </Button>
      </div>
      
    </div>
  );
}
