import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, PenTool, Globe, LayoutGrid, CheckCircle, Box, ChevronRight } from 'lucide-react';
import type { DashboardData } from '@/services/homeService';

interface HomeQuickStartsProps {
  starts: DashboardData['quickStarts'];
}

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = { Search, FileText, PenTool, Globe, LayoutGrid, CheckCircle, Box };
  return icons[iconName] || FileText;
};

export function HomeQuickStarts({ starts }: HomeQuickStartsProps) {
  return (
    <div className="mt-0">
      <h2 className="text-[0.95rem] md:text-lg font-bold text-foreground mb-3">Quick Start</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {starts.map((start, i) => {
          const Icon = getIcon(start.iconName);
          return (
            <Card key={i} className="group border border-border/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer rounded-[16px] md:rounded-[20px] bg-card">
              <CardContent className="p-3 md:p-4 flex items-center justify-between gap-2.5 h-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${start.bg} dark:bg-muted`}>
                    <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${start.color}`} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-[0.75rem] md:text-[0.85rem] text-foreground group-hover:text-primary transition-colors leading-tight">{start.title}</h3>
                    <p className="text-[0.65rem] md:text-[0.75rem] text-muted-foreground font-medium mt-0.5 md:mt-1 leading-snug pr-2">{start.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" strokeWidth={3} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
