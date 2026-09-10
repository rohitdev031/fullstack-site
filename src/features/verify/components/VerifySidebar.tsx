import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Search, FileText, Upload, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VerificationData } from '@/services/verifyService';
import { useAppContext } from '@/context/AppContext';
import { AVAILABLE_MODELS } from '@/features/ask/types';

interface VerifySidebarProps {
  metrics: VerificationData['metrics'];
  keyIssues: VerificationData['keyIssues'];
  recommendations: VerificationData['recommendations'];
  settings: VerificationData['settings'];
}

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = { CheckCircle2, AlertTriangle, XCircle };
  return icons[iconName] || CheckCircle2;
};

export function VerifySidebar({ metrics, keyIssues, recommendations, settings }: VerifySidebarProps) {
  const { currentModel } = useAppContext();
  const selectedModelObj = AVAILABLE_MODELS.find(m => m.id === currentModel) || AVAILABLE_MODELS[0];

  return (
    <div className="hidden xl:flex flex-col w-85 gap-6 shrink-0">

      {/* Verification Summary */}
      <div className="bg-card text-card-foreground shadow-sm border border-border/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[15px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Verification Summary
          </h3>
          <Badge
            variant="outline"
            className={`font-bold px-2.5 py-0.5 text-[11px] ${
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
        <div className="flex items-center gap-8 mb-2">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0 ml-2">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 drop-shadow-sm">
              <path className="text-muted stroke-current" strokeWidth="2.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500 stroke-current" strokeWidth="2.5" strokeDasharray={`${metrics.accuracy}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{metrics.accuracy}%</span>
              <span className="text-[9px] text-muted-foreground uppercase text-center font-bold tracking-wider mt-0.5">Overall<br/>Accuracy</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-[13px] font-bold text-muted-foreground">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div> <span className={['text-emerald-700', 'dark:text-emerald-400'].join(' ')}>{metrics.correct} Correct</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div> <span className={['text-amber-600', 'dark:text-amber-400'].join(' ')}>{metrics.partiallyCorrect} Partially Correct</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div> <span className={['text-red-600', 'dark:text-red-400'].join(' ')}>{metrics.incorrect} Incorrect</span></div>
          </div>
        </div>
      </div>

      {/* Key Issues Found */}
      <div className="bg-card text-card-foreground shadow-sm border border-border/50 rounded-2xl p-6">
        <div className="flex flex-col mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-[15px]">Key Issues Found</h4>
            <Badge variant="destructive" className={['bg-red-50', 'text-red-700 hover:bg-red-50', 'border-red-200', 'dark:border-red-900', 'font-bold rounded-full px-2 py-0.5 text-[10px] shadow-xs'].join(' ')}>
              {keyIssues.filter(i => i.priority === 'High').length} High Priority
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {keyIssues.map((issue, i) => {
            const Icon = getIcon(issue.iconName);
            return (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background hover:shadow-sm transition-all">
              <div className={`p-2 rounded-lg ${issue.bgClass}`}>
                <Icon className={`w-5 h-5 ${issue.colorClass}`} />
              </div>
              <div>
                <h5 className="text-[13px] font-bold text-foreground leading-snug mb-1">{issue.title}</h5>
                <p className="text-[12px] text-muted-foreground font-medium leading-relaxed">{issue.description}</p>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card text-card-foreground shadow-sm border border-border/50 rounded-2xl p-6">
        <h4 className="font-bold text-[15px] mb-5">Recommendations</h4>
        <ul className="space-y-4">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-[13px] text-muted-foreground font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 bg-emerald-50 rounded-full" /> <span className="leading-relaxed">{rec}</span></li>
          ))}
        </ul>
      </div>

      {/* Verification Settings */}
      <div className="flex flex-col gap-4 mt-2">
        <h4 className="font-bold text-[13px] text-foreground">Verification Settings</h4>
        <div className="flex justify-between items-center text-[12px] font-medium">
          <span className="text-muted-foreground">Verification Model</span>
          <span className="text-foreground text-right">{selectedModelObj.name}</span>
        </div>
        <div className="flex justify-between items-center text-[12px] font-medium">
          <span className="text-muted-foreground">Web Search</span>
          <span className="text-foreground text-right">{settings.webSearch}</span>
        </div>
        <div className="flex justify-between items-center text-[12px] font-medium">
          <span className="text-muted-foreground">Fact-Checking Level</span>
          <span className="text-foreground text-right">{settings.factCheckingLevel}</span>
        </div>
        <Button variant="link" className="px-0 mt-1 text-indigo-600 h-auto text-[13px] font-bold w-fit hover:no-underline hover:text-indigo-700 flex items-center gap-1">
          Advanced Settings <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Quick Tools */}
      <div className="flex flex-col gap-4 mt-4 mb-10">
        <h4 className="font-bold text-[13px] text-foreground">Quick Tools</h4>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-[13px] font-bold text-foreground cursor-pointer hover:text-indigo-600 transition-colors group">
            <div className={['w-6 h-6 rounded-md', 'bg-indigo-50', 'dark:bg-indigo-900/20', 'text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors'].join(' ')}>
              <Search className="w-3.5 h-3.5" />
            </div>
            Search for Supporting Evidence
          </div>

          <div className="flex items-center gap-3 text-[13px] font-bold text-foreground cursor-pointer hover:text-indigo-600 transition-colors group">
            <div className={['w-6 h-6 rounded-md', 'bg-indigo-50', 'dark:bg-indigo-900/20', 'text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors'].join(' ')}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            Check Related Research
          </div>

          <div className="flex items-center gap-3 text-[13px] font-bold text-foreground cursor-pointer hover:text-indigo-600 transition-colors group">
            <div className={['w-6 h-6 rounded-md', 'bg-indigo-50', 'dark:bg-indigo-900/20', 'text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors'].join(' ')}>
              <FileText className="w-3.5 h-3.5" />
            </div>
            Generate Summary Report
          </div>

          <div
            onClick={() => {
              const content = `Verification Report
Model: ${selectedModelObj.name}
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
            }}
            className="flex items-center gap-3 text-[13px] font-bold text-foreground cursor-pointer hover:text-indigo-600 transition-colors group"
          >
            <div className={['w-6 h-6 rounded-md', 'bg-indigo-50', 'dark:bg-indigo-900/20', 'text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors'].join(' ')}>
              <Upload className="w-3.5 h-3.5" />
            </div>
            Export Verification Report
          </div>
        </div>
      </div>
    </div>
  );
}
