import { useState, useEffect } from 'react';
import { Sparkles, Copy, ThumbsUp, ThumbsDown, CheckCircle2, ChevronRight, ChevronDown, Share2, X, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { compareService } from '@/services/compareService';
import type { AIModel, ComparisonResult } from '@/services/compareService';

const getIcon = (iconName: string) => {
  switch(iconName) {
    case 'GPT': return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
    case 'Claude': return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>;
    case 'Gemini': return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
    case 'Llama': return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>;
    default: return <Sparkles className="w-3.5 h-3.5" />;
  }
};

export function CompareView() {
  const { webSearchEnabled, setWebSearchEnabled } = useAppContext();
  const [prompt, setPrompt] = useState('What are the most effective strategies for improving productivity while working from home?');
  const [isComparing, setIsComparing] = useState(false);
  const [allAvailableModels, setAllAvailableModels] = useState<AIModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  
  useEffect(() => {
    const fetchModels = async () => {
      const models = await compareService.getAvailableModels();
      setAllAvailableModels(models);
      setSelectedModels(models.slice(0, 3));
    };
    fetchModels();
  }, []);

  const handleCompare = async () => {
    setIsComparing(true);
    const mockResults = await compareService.comparePrompt(prompt, selectedModels.map(m => m.name));
    setResults(mockResults);
    setIsComparing(false);
  };

  const removeModel = (modelName: string) => {
    setSelectedModels(prev => prev.filter(m => m.name !== modelName));
  };

  const addModel = () => {
    if (selectedModels.length >= 4) return;
    const unselected = allAvailableModels.find(m => !selectedModels.find(sm => sm.name === m.name));
    if (unselected) {
      setSelectedModels(prev => [...prev, unselected]);
    }
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 pb-20 md:pb-12 h-full overflow-y-auto scrollbar-hide pr-2">
      
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
               <div key={model.name} className="flex items-center h-10 px-3 text-[13px] font-bold gap-2.5 bg-[#F4F3FF] dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group/badge transition-colors cursor-default">
                 <div className="w-5.5 h-5.5 rounded-full bg-white dark:bg-indigo-950 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
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
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full"><Share2 className="w-5 h-5" /></Button>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full">
          {selectedModels.slice(0, 2).map((m) => (
             <div key={m.name} className="flex-1 bg-background border border-border/50 rounded-xl px-3 py-3 text-sm flex justify-between items-center shadow-sm font-bold">
               {m.name} <ChevronDown className="w-4 h-4 text-muted-foreground" />
             </div>
          ))}
        </div>
        <Button onClick={handleCompare} className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md font-bold h-12 text-base rounded-xl mt-2">
          Compare
        </Button>
      </div>

      {isComparing ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
           <div className="flex items-center gap-2.5 text-indigo-500">
             <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/80 animate-bounce"></span>
             <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/80 animate-bounce delay-75"></span>
             <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/80 animate-bounce delay-150"></span>
           </div>
           <p className="text-muted-foreground font-semibold">Generating comparisons from {selectedModels.length} models...</p>
        </div>
      ) : (
        <>
          {/* Comparison Grid */}
          <div className={`grid ${selectedModels.length === 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} ${selectedModels.length === 3 ? 'md:grid-cols-3' : ''} ${selectedModels.length === 4 ? 'md:grid-cols-4' : ''} gap-3 md:gap-6 shrink-0`}>
            {selectedModels.map((model, i) => {
              const result = results.find(r => r.modelName === model.name);
              const mockContent = result ? (
                <p className="whitespace-pre-wrap">{result.response}</p>
              ) : (
                <>
                  <p className="mb-4">Improving productivity while working from home requires a combination of environment design, routine management, and focus strategies.</p>
                  <h4 className="font-bold mb-3 text-foreground">Key Strategies</h4>
                  <ol className="list-decimal pl-5 space-y-2 mb-4">
                    <li className="text-foreground"><strong>Create a dedicated workspace</strong></li>
                    <li className="text-foreground"><strong>Establish a consistent routine</strong></li>
                    <li className="text-foreground"><strong>Use time blocking techniques</strong></li>
                    <li className="text-foreground"><strong>Minimize digital distractions</strong></li>
                    <li className="text-foreground"><strong>Take regular breaks</strong></li>
                    <li className="text-foreground"><strong>Set clear boundaries</strong></li>
                  </ol>
                  <p className="mt-4">In summary, structure, discipline, and a distraction-free environment are key to maintaining high productivity at home.</p>
                </>
              );

              return (
                <ComparisonCard 
                  key={model.name}
                  model={model.name} 
                  icon={getIcon(model.iconName)}
                  match={i === 1 ? "Excellent match" : "Good match"}
                  matchColor={i === 1 ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"}
                  content={mockContent}
                  sources={Math.floor(Math.random() * 3) + 5}
                />
              );
            })}
          </div>

          {/* Bottom Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 shrink-0">
            
            {/* Key Takeaways */}
            <Card className="shadow-sm border-border/50 flex flex-col h-full rounded-2xl">
              <CardContent className="p-6 flex flex-col h-full">
                <h3 className="font-bold text-[15px] mb-5">Key Takeaways</h3>
                <ul className="space-y-4 flex-1">
                  <li className="flex gap-3 text-[13px]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">All models emphasize the importance of a dedicated workspace and consistent routine.</span>
                  </li>
                  <li className="flex gap-3 text-[13px]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">Focus on minimizing distractions and managing energy levels.</span>
                  </li>
                  <li className="flex gap-3 text-[13px]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">Regular breaks and boundaries are essential for long-term productivity.</span>
                  </li>
                </ul>
                <Button variant="link" className="px-0 mt-6 text-indigo-600 h-auto text-[13px] font-bold w-fit hover:no-underline hover:text-indigo-700">
                  View Full Analysis <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Model Agreement */}
            <Card className="hidden lg:flex flex-col shadow-sm border-border/50 h-full rounded-2xl">
              <CardContent className="p-6 flex flex-col h-full">
                <h3 className="font-bold text-[15px] mb-6">Model Agreement</h3>
                <div className="space-y-5 text-[13px] font-bold flex-1">
                   <AgreementRow label="Dedicated Workspace" value="High" percent="100%" color="bg-emerald-400" width="w-full" />
                   <AgreementRow label="Consistent Routine" value="High" percent="100%" color="bg-emerald-400" width="w-full" />
                   <AgreementRow label="Minimize Distractions" value="High" percent="100%" color="bg-emerald-400" width="w-full" />
                   <AgreementRow label="Regular Breaks" value="Medium" percent="67%" color="bg-amber-400" width="w-[67%]" />
                   <AgreementRow label="Health & Well-being" value="High" percent="100%" color="bg-emerald-400" width="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Which Answer is Best? */}
            <Card className="shadow-sm border-border/50 h-full rounded-2xl overflow-hidden flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                <h3 className="font-bold text-[15px] mb-5">Which Answer is Best?</h3>
                <div className="bg-background border border-border/50 rounded-xl p-5 shadow-sm relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-bold flex items-center gap-1.5 text-[15px]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                      {selectedModels.length > 1 ? selectedModels[1].name : selectedModels[0]?.name || 'Loading...'}
                    </span>
                    <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-orange-200/50 ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>🏆</span> Best Overall
                    </Badge>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed font-medium flex-1">
                    Provides the most comprehensive and actionable strategies with a strong focus on systems and sustainable habits.
                  </p>
                  <Button variant="link" className="px-0 mt-6 text-indigo-600 h-auto text-[13px] font-bold w-fit hover:no-underline hover:text-indigo-700">
                    View Full Analysis <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

    </div>
  );
}

function ComparisonCard({ model, icon, match, matchColor, content, sources }: any) {
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

function AgreementRow({ label, value, percent, color, width }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="truncate w-40 text-foreground">{label}</span>
      <div className="flex items-center gap-3 w-40">
        <span className={`w-14 text-xs font-bold ${value === 'High' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{value}</span>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${color} ${width}`} />
        </div>
      </div>
      <span className="text-foreground w-10 text-right">{percent}</span>
    </div>
  );
}
