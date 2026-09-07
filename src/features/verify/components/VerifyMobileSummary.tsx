import { CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import type { VerificationData } from '@/services/verifyService';

interface VerifyMobileSummaryProps {
  metrics: VerificationData['metrics'];
}

export function VerifyMobileSummary({ metrics }: VerifyMobileSummaryProps) {
  return (
    <div className="md:hidden flex flex-col gap-4 mt-2">
      <h3 className="text-[15px] font-bold text-foreground mb-2">Independent Review</h3>
      
      <div className="flex flex-col gap-4 text-[13px] leading-relaxed">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
          <div><span className="font-bold text-emerald-600">Correct</span> The Eiffel Tower is 330 meters tall and was completed in 1889.</div>
        </div>
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
          <div><span className="font-bold text-amber-600">Potential issue</span> Completion year is 1889 (not 1888).</div>
        </div>
        <div className="flex items-start gap-2.5">
          <XCircle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
          <div><span className="font-bold text-red-600">Missing</span> Could mention it's located in Paris, France.</div>
        </div>
      </div>

      <div className="bg-card text-card-foreground shadow-sm border border-border/50 rounded-xl p-4 mt-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-bold text-[14px]">Verification Result</span>
          <span className="text-red-500 font-medium text-[13px]">{metrics.incorrect > 0 ? `${metrics.incorrect} issues found` : 'Verified'}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}
