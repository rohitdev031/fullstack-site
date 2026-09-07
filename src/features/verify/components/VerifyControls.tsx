import { Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/useAppContext';
import { type ModelId, AVAILABLE_MODELS } from '@/features/ask/types';

interface VerifyControlsProps {
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
}

export function VerifyControls({ webSearchEnabled, setWebSearchEnabled }: VerifyControlsProps) {
  const { currentModel, setCurrentModel } = useAppContext();

  return (
    <div className="hidden md:flex items-center gap-5 mt-2 shrink-0">
      <h3 className="font-bold text-[15px]">Independent Verification</h3>

      <div className="w-48">
        <Select value={currentModel} onValueChange={(val) => setCurrentModel(val as ModelId)}>
          <SelectTrigger className="flex items-center justify-between w-full h-9 p-2 px-3 bg-background border border-border/60 hover:border-border cursor-pointer transition-colors rounded-lg shadow-xs text-[13px] font-bold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>
                <SelectValue placeholder="Select a model" />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id} className="text-[13px] font-medium">
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <span className="text-[13px] font-bold text-muted-foreground">Web Search</span>
        <Switch checked={webSearchEnabled} onCheckedChange={setWebSearchEnabled} className="data-[state=checked]:bg-indigo-500 scale-90" />
      </div>
    </div>
  );
}
