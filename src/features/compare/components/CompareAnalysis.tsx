import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { CompareAnalysisData } from '@/services/compareService';

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
  analysis: CompareAnalysisData;
}

export function CompareAnalysis({ analysis }: CompareAnalysisProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 shrink-0">
      
      {/* Key Takeaways */}
      <Card className="shadow-sm border-border/50 flex flex-col h-full rounded-2xl">
        <CardContent className="p-6 flex flex-col h-full">
          <h3 className="font-bold text-[15px] mb-5">Key Takeaways</h3>
          <ul className="space-y-4 flex-1">
            {analysis.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex gap-3 text-[13px]">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{takeaway}</span>
              </li>
            ))}
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
             {analysis.agreements.map((agreement, i) => (
               <AgreementRow 
                 key={i} 
                 label={agreement.label} 
                 value={agreement.value} 
                 percent={agreement.percent} 
                 color={agreement.color} 
                 width={agreement.width} 
               />
             ))}
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
                {analysis.bestAnswer.modelName}
              </span>
              <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-orange-200/50 ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>🏆</span> Best Overall
              </Badge>
            </div>
            <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed font-medium flex-1">
              {analysis.bestAnswer.reason}
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
