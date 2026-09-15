import { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ShieldCheck,
  Upload,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VerificationData } from '@/services/ai/types';

interface VerifyMobileDashboardProps {
  metrics: VerificationData['metrics'];
  claims: VerificationData['claims'];
  keyIssues: VerificationData['keyIssues'];
  recommendations: VerificationData['recommendations'];
  settings: VerificationData['settings'];
  modelName: string;
}

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = { CheckCircle2, AlertTriangle, XCircle };
  return icons[iconName] || CheckCircle2;
};

export function VerifyMobileDashboard({ 
  metrics, 
  claims, 
  keyIssues, 
  recommendations, 
  modelName
}: VerifyMobileDashboardProps) {
  const [expandedClaimIndex, setExpandedClaimIndex] = useState<number | null>(null);

  const toggleClaim = (index: number) => {
    setExpandedClaimIndex(expandedClaimIndex === index ? null : index);
  };

  const handleExport = () => {
    const content = `Verification Report
Model: ${modelName}
Accuracy: ${metrics.accuracy}%

Claims Breakdown:
- Correct: ${metrics.correct}
- Partially Correct: ${metrics.partiallyCorrect}
- Incorrect: ${metrics.incorrect}

Key Issues Found:
${keyIssues.map(i => `- [${i.priority}] ${i.title}: ${i.description}`).join('\n')}

Recommendations:
${recommendations.map(r => `- ${r}`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="md:hidden flex flex-col gap-6 mt-4 pb-6">
      
      {/* 1. Summary Card */}
      <div className="bg-card text-card-foreground shadow-sm border border-border/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[15px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Verification Summary
          </h3>
          <Badge 
            variant="outline" 
            className={`font-bold px-2 py-0.5 text-[10px] ${
              metrics.incorrect > 0 
                ? ['bg-red-50', 'text-red-700', 'border-red-200', 'dark:bg-red-900/20', 'dark:border-red-800'].join(' ') 
                : metrics.partiallyCorrect > 0 
                  ? ['bg-amber-50', 'text-amber-700', 'border-amber-200', 'dark:bg-amber-900/20', 'dark:border-amber-800'].join(' ')
                  : ['bg-emerald-50', 'text-emerald-700', 'border-emerald-200', 'dark:bg-emerald-900/20', 'dark:border-emerald-800'].join(' ')
            }`}
          >
            {metrics.incorrect > 0 ? 'Issues Found' : metrics.partiallyCorrect > 0 ? 'Partially Verified' : 'Verified'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 drop-shadow-sm">
              <path className="text-muted stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500 stroke-current" strokeWidth="3" strokeDasharray={`${metrics.accuracy}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">{metrics.accuracy}%</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 text-[12px] font-bold text-muted-foreground w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> <span className={['text-emerald-700', 'dark:text-emerald-400'].join(' ')}>Correct</span></div>
              <span className="text-foreground">{metrics.correct}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> <span className={['text-amber-600', 'dark:text-amber-400'].join(' ')}>Partial</span></div>
              <span className="text-foreground">{metrics.partiallyCorrect}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> <span className={['text-red-600', 'dark:text-red-400'].join(' ')}>Incorrect</span></div>
              <span className="text-foreground">{metrics.incorrect}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Claims List (Accordion) */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-[15px] flex items-center justify-between px-1">
          Detailed Claims <span className="text-muted-foreground text-xs font-semibold">{metrics.totalClaims} Total</span>
        </h3>
        <div className="flex flex-col gap-2">
          {claims.map((claim, index) => {
            const Icon = getIcon(claim.iconName);
            const isExpanded = expandedClaimIndex === index;
            
            return (
              <div 
                key={index} 
                className={`bg-card shadow-sm border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-border/80' : 'border-border/40'}`}
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleClaim(index)}
                  className={`p-4 flex flex-col gap-2 cursor-pointer transition-colors ${isExpanded ? 'bg-muted/10' : 'active:bg-muted/30'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${claim.color}`} />
                      <span className="font-bold text-[13px] text-foreground leading-snug line-clamp-2">{claim.text}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 mt-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                  <Badge variant="secondary" className={`w-fit text-[10px] px-2 py-0 ${claim.color} bg-background border border-border/50`}>
                    {claim.status}
                  </Badge>
                </div>
                
                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-4 pt-0 text-[13px] text-muted-foreground font-medium leading-relaxed bg-muted/10 border-t border-border/30 animate-in slide-in-from-top-1 fade-in duration-200">
                    <div className="pt-3">{claim.details}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Key Issues & Recommendations */}
      <div className="bg-card text-card-foreground shadow-sm border border-border/50 rounded-2xl p-5 flex flex-col gap-5">
        
        {/* Issues */}
        {keyIssues.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[14px]">Key Issues</h4>
              <Badge variant="destructive" className={['bg-red-50', 'text-red-700', 'border-red-200', 'dark:bg-red-900/20', 'dark:border-red-800', 'font-bold rounded-full px-2 py-0 text-[10px]'].join(' ')}>
                {keyIssues.length} Found
              </Badge>
            </div>
            <div className="flex flex-col gap-3">
              {keyIssues.map((issue, i) => {
                const Icon = getIcon(issue.iconName);
                return (
                  <div key={i} className="flex items-start gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
                    <div className={`p-1.5 rounded-lg shrink-0 ${issue.bgClass}`}>
                      <Icon className={`w-3.5 h-3.5 ${issue.colorClass}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-foreground leading-tight mb-1">{issue.title}</span>
                      <span className="text-[11px] text-muted-foreground leading-snug">{issue.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-[14px]">Recommendations</h4>
          <ul className="space-y-2.5">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-[12px] text-muted-foreground font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> 
                <span className="leading-snug">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Tools & Settings */}
      <div className="flex flex-col gap-3">
        <Button onClick={handleExport} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-md gap-2">
          <Upload className="w-4 h-4" /> Export Report
        </Button>
        <Button variant="outline" className="w-full bg-card font-bold h-12 rounded-xl shadow-sm gap-2">
          <Settings className="w-4 h-4" /> Advanced Settings
        </Button>
      </div>

    </div>
  );
}

