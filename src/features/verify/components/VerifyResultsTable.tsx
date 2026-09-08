import { Sparkles, CheckCircle2, AlertTriangle, XCircle, ChevronDown, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VerificationData } from '@/services/verifyService';

interface VerifyResultsTableProps {
  metrics: VerificationData['metrics'];
  claims: VerificationData['claims'];
  selectedClaimIndex?: number | null;
  onClaimSelect?: (index: number | null) => void;
}

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = { CheckCircle2, AlertTriangle, XCircle };
  return icons[iconName] || CheckCircle2;
};

export function VerifyResultsTable({
  metrics,
  claims,
  selectedClaimIndex = null,
  onClaimSelect
}: VerifyResultsTableProps) {
  return (
    <div className="hidden md:flex bg-card text-card-foreground shadow-sm border border-border/50 rounded-2xl flex-col overflow-hidden shrink-0">

      <div className="p-6 border-b border-border/50 bg-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={['w-10 h-10', 'bg-indigo-50', 'dark:bg-indigo-900/20', 'rounded-xl flex items-center justify-center shadow-xs border', 'border-indigo-100', 'dark:border-indigo-800/30'].join(' ')}>
            <Sparkles className={['w-5 h-5', 'text-indigo-600', 'dark:text-indigo-400'].join(' ')} />
          </div>
          <div>
            <h3 className="font-bold text-[14px]">Verification Results</h3>
            <p className="text-[12px] text-muted-foreground font-medium">Our independent analysis of the claims in this answer</p>
          </div>
        </div>

        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide shrink-0 max-w-full pb-1 md:pb-0">
           <div className={['flex items-center gap-1.5 px-2.5 py-1', 'bg-indigo-50/50', 'dark:bg-indigo-900/20', 'border', 'border-indigo-100/50', 'dark:border-indigo-800/30', 'rounded-md text-[12px] font-bold', 'text-indigo-700', 'dark:text-indigo-400', 'shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/40 cursor-default whitespace-nowrap shrink-0'].join(' ')}>
             <span className={['text-indigo-600', 'dark:text-indigo-400', 'text-[13px]'].join(' ')}>{metrics.totalClaims}</span> Total Claims
           </div>
           <div className={['flex items-center gap-1.5 px-2.5 py-1', 'bg-emerald-50/50', 'dark:bg-emerald-900/20', 'border', 'border-emerald-100/50', 'dark:border-emerald-800/30', 'rounded-md text-[12px] font-bold', 'text-emerald-700', 'dark:text-emerald-400', 'shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/40 cursor-default whitespace-nowrap shrink-0'].join(' ')}>
             <span className="text-[13px]">{metrics.correct}</span> Correct
           </div>
           <div className={['flex items-center gap-1.5 px-2.5 py-1', 'bg-amber-50/50', 'dark:bg-amber-900/20', 'border', 'border-amber-100/50', 'dark:border-amber-800/30', 'rounded-md text-[12px] font-bold', 'text-amber-700', 'dark:text-amber-400', 'shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/40 cursor-default whitespace-nowrap shrink-0'].join(' ')}>
             <span className="text-[13px]">{metrics.partiallyCorrect}</span> Partially Correct
           </div>
           <div className={['flex items-center gap-1.5 px-2.5 py-1', 'bg-red-50/50', 'dark:bg-red-900/20', 'border', 'border-red-100/50', 'dark:border-red-800/30', 'rounded-md text-[12px] font-bold', 'text-red-700', 'dark:text-red-400', 'shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:bg-red-50 dark:hover:bg-red-900/40 cursor-default whitespace-nowrap shrink-0'].join(' ')}>
             <span className="text-[13px]">{metrics.incorrect}</span> Incorrect
           </div>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
         <table className="w-full text-[13px] text-left border-collapse">
           <thead className="text-muted-foreground font-bold border-b border-border/50">
             <tr>
               <th className="px-6 py-4 font-bold">Claim</th>
               <th className="px-6 py-4 font-bold">Assessment</th>
               <th className="px-6 py-4 font-bold">Details</th>
               <th className="px-6 py-4"></th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border/50">
             {claims.map((claim, i) => {
               const Icon = getIcon(claim.iconName);
               const isSelected = selectedClaimIndex === i;
               return (
               <tr
                 key={i}
                 className={`transition-colors group cursor-pointer ${isSelected ? ['bg-muted/80', 'dark:bg-muted/50'].join(' ') : 'hover:bg-muted/30'}`}
                 onClick={() => onClaimSelect?.(isSelected ? null : i)}
               >
                 <td className="px-6 py-4 flex items-start gap-3 w-full max-w-lg">
                   <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${claim.color}`} />
                   <span className="font-bold text-foreground leading-relaxed">{claim.text}</span>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap align-top pt-4">
                   <span className={`font-bold ${claim.color}`}>{claim.status}</span>
                 </td>
                 <td className="px-6 py-4 text-muted-foreground font-medium align-top pt-4">{claim.details}</td>
                 <td className="px-6 py-4 text-right align-top pt-4">
                   <ChevronDown className={`w-4 h-4 text-muted-foreground/50 transition-transform ${isSelected ? 'rotate-180 text-foreground' : 'group-hover:text-foreground'} inline-block`} />
                 </td>
               </tr>
             )})}
           </tbody>
         </table>
      </div>

      <div className="p-5 border-t border-border/50 flex items-center justify-between gap-3 bg-background rounded-b-2xl">
         <Button variant="outline" className="h-9 px-4 gap-2 bg-background rounded-lg shadow-xs font-bold text-[13px] text-foreground hover:bg-muted/50 border-border/60">
           Show Evidence & Sources for All Claims <ChevronDown className="w-4 h-4" />
         </Button>
         <Button variant="outline" className="h-9 px-4 gap-2 bg-background rounded-lg shadow-xs font-bold text-[13px] text-foreground hover:bg-muted/50 border-border/60">
           <Upload className="w-4 h-4" /> Export Report
         </Button>
      </div>
    </div>
  );
}
