import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { AIModel } from '@/services/compareService';

interface AgreementRowProps {
  label: string;
  value: string;
  percent: string;
  color: string;
  width: string;
}

function AgreementRow({ label, value, percent, color, width }: AgreementRowProps) {
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

interface CompareAnalysisProps {
  selectedModels: AIModel[];
}

export function CompareAnalysis({ selectedModels }: CompareAnalysisProps) {
  return (
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
  );
}
