import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sparkles, X, Plus, ChevronDown, Share2 } from 'lucide-react';
import type { AIModel } from '@/services/compareService';
import { getIcon } from './iconMap';

interface CompareControlsProps {
  prompt: string;
  setPrompt: (val: string) => void;
  allAvailableModels: AIModel[];
  selectedModels: AIModel[];
  removeModel: (name: string) => void;
  addModel: () => void;
  swapModel: (index: number, newModelName: string) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (val: boolean) => void;
  handleCompare: () => void;
}

export function CompareControls({
  prompt,
  setPrompt,
  allAvailableModels,
  selectedModels,
  removeModel,
  addModel,
  swapModel,
  webSearchEnabled,
  setWebSearchEnabled,
  handleCompare
}: CompareControlsProps) {

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Compare AI Models',
          text: 'Check out this comparison of AI models!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:flex flex-col shrink-0 mt-2">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Compare</h1>
        <p className="text-muted-foreground text-[15px]">Compare AI responses side by side to find the best answer</p>
      </div>

      {/* Unified Top Controls Box */}
      <div className="hidden md:flex bg-background border border-border/50 rounded-2xl p-6 shadow-sm w-full shrink-0">
        
        {/* Left Side: Your Question */}
        <div className="flex flex-col w-[40%] pr-8 border-r border-border/50">
          <h3 className="text-sm font-bold text-foreground mb-4">Your Question</h3>
          <Textarea 
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             className="min-h-25 border-0 p-0 shadow-none focus-visible:ring-0 resize-none text-[15px] leading-relaxed bg-transparent text-foreground/90 font-medium"
             placeholder="Type your prompt here..."
          />
        </div>

        {/* Right Side: Select Models & Actions */}
        <div className="flex flex-col flex-1 pl-8">
          <h3 className="text-sm font-bold text-foreground mb-4">Select Models <span className="text-muted-foreground font-medium">({selectedModels.length}/4)</span></h3>
          
          {/* Model Pills */}
          <div className="flex flex-wrap items-center gap-3">
             {selectedModels.map((model) => (
               <div key={model.name} className={['flex items-center h-10 px-3 text-[13px] font-bold gap-2.5', 'bg-[#F4F3FF]', 'dark:bg-indigo-900/20', 'text-indigo-600', 'dark:text-indigo-400', 'rounded-lg group/badge transition-colors cursor-default'].join(' ')}>
                 <div className={['w-5.5 h-5.5 rounded-full', 'bg-white', 'dark:bg-indigo-950', 'flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]'].join(' ')}>
                   {getIcon(model.iconName)}
                 </div>
                 {model.name} 
                 <button onClick={() => removeModel(model.name)} className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200 ml-0.5 rounded-full transition-colors focus:outline-none">
                    <X className="w-3.5 h-3.5" />
                 </button>
               </div>
             ))}
             {selectedModels.length < 4 && (
               <Button onClick={addModel} variant="outline" size="sm" className="h-10 px-4 gap-2 text-[13px] font-semibold border-border/60 rounded-lg text-foreground hover:bg-muted/50 bg-background shadow-xs">
                 <Plus className="w-4 h-4" /> Add Model
               </Button>
             )}
          </div>

          {/* Actions (Aligned Bottom Right) */}
          <div className="mt-auto flex justify-end items-center gap-6 pt-6">
             <div className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
               Web Search <Switch checked={webSearchEnabled} onCheckedChange={setWebSearchEnabled} className="data-[state=checked]:bg-indigo-500 scale-90" />
             </div>
             <Button onClick={handleCompare} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-bold h-10 px-6 rounded-lg gap-2 transition-all">
               <Sparkles className="w-4 h-4" /> Compare
             </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Top Controls (Simplified) */}
      <div className="md:hidden flex flex-col gap-4 mb-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Select models</span>
          <div className="flex items-center gap-2">
            <Button onClick={handleShare} variant="ghost" size="icon" className="h-10 w-10 rounded-full"><Share2 className="w-5 h-5" /></Button>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full">
          {selectedModels.slice(0, 2).map((m, index) => (
             <div key={index} className="relative flex-1 bg-background border border-border/50 rounded-xl shadow-sm overflow-hidden">
               <select 
                 value={m.name}
                 onChange={(e) => swapModel(index, e.target.value)}
                 className="w-full h-12 px-3 py-3 text-sm font-bold appearance-none bg-transparent outline-none focus:ring-0 z-10 relative cursor-pointer"
               >
                 {allAvailableModels.map(available => (
                   <option key={available.name} value={available.name}>
                     {available.name}
                   </option>
                 ))}
               </select>
               <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-0" />
             </div>
          ))}
        </div>
        <Button onClick={handleCompare} className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md font-bold h-12 text-base rounded-xl mt-2">
          Compare
        </Button>
      </div>
    </>
  );
}
