import { Sparkles, FileText, PenTool, ArrowLeftRight, ShieldCheck, Globe, X } from 'lucide-react';
import { AVAILABLE_MODELS, type ModelId } from '../types';
import { useTip } from '../hooks/useTip';

type AskSidebarProps = {
  currentModel: ModelId;
  onAnalyzeDocument: () => void;
  onWriteContent: () => void;
  onCompareModels: () => void;
  onVerifyAnswer: () => void;
  onToggleWebSearch: () => void;
};

export function AskSidebar({
  currentModel,
  onAnalyzeDocument,
  onWriteContent,
  onCompareModels,
  onVerifyAnswer,
  onToggleWebSearch
}: AskSidebarProps) {
  const { tip, isVisible, dismissTip } = useTip();
  const modelName = AVAILABLE_MODELS.find(m => m.id === currentModel)?.name || currentModel;

  return (
    <div className="hidden xl:flex flex-col w-75 gap-6 shrink-0 overflow-y-auto scrollbar-hide pb-10">

      {/* Current Model */}
      <div className="bg-background border border-border/60 rounded-2xl p-5 shadow-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Current Model
        </h3>
        <div className="bg-background rounded-xl p-4 border border-border/60 cursor-pointer hover:border-border transition-colors group shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-sm text-foreground">{modelName}</h4>
            </div>

          </div>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed ml-6 mt-1">Best for complex analysis</p>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="bg-background border border-border/60 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold mb-4">Quick Tools</h3>
        <div className="flex flex-col gap-2.5">
          <div onClick={onAnalyzeDocument} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border cursor-pointer transition-all hover:shadow-xs bg-background">
            <div className={['p-1.5', 'bg-green-100', 'dark:bg-green-900/30', 'text-green-600', 'rounded-lg', 'shrink-0'].join(' ')}><FileText className="w-4 h-4" /></div>
            <span className="text-[13px] font-bold text-foreground">Analyze Document</span>
          </div>
          <div onClick={onWriteContent} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border cursor-pointer transition-all hover:shadow-xs bg-background">
            <div className={['p-1.5', 'bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'rounded-lg', 'shrink-0'].join(' ')}><PenTool className="w-4 h-4" /></div>
            <span className="text-[13px] font-bold text-foreground">Write Content</span>
          </div>
          <div onClick={onCompareModels} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border cursor-pointer transition-all hover:shadow-xs bg-background">
            <div className={['p-1.5', 'bg-orange-100', 'dark:bg-orange-900/30', 'text-orange-600', 'rounded-lg', 'shrink-0'].join(' ')}><ArrowLeftRight className="w-4 h-4" /></div>
            <span className="text-[13px] font-bold text-foreground">Compare Models</span>
          </div>
          <div onClick={onVerifyAnswer} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border cursor-pointer transition-all hover:shadow-xs bg-background">
            <div className={['p-1.5', 'bg-blue-100', 'dark:bg-blue-900/30', 'text-blue-600', 'rounded-lg', 'shrink-0'].join(' ')}><ShieldCheck className="w-4 h-4" /></div>
            <span className="text-[13px] font-bold text-foreground">Verify Answer</span>
          </div>
          <div onClick={onToggleWebSearch} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border cursor-pointer transition-all hover:shadow-xs bg-background">
            <div className={['p-1.5', 'bg-indigo-100', 'dark:bg-indigo-900/30', 'text-indigo-600', 'rounded-lg', 'shrink-0'].join(' ')}><Globe className="w-4 h-4" /></div>
            <span className="text-[13px] font-bold text-foreground">Web Search</span>
          </div>
        </div>
      </div>

      {isVisible && tip && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 shadow-xs relative group animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-[13px] font-bold text-indigo-900">{tip.title}</h3>
          </div>
          <p className="text-xs text-indigo-800/80 leading-relaxed font-medium">
            {tip.content}
          </p>
          <button
            onClick={dismissTip}
            className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
