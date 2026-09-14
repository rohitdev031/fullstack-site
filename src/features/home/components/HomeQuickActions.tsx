import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, PenTool, Globe, LayoutGrid, CheckCircle, Box } from 'lucide-react';
import type { DashboardData } from '../homeConfig';

interface HomeQuickActionsProps {
  actions: DashboardData['quickActions'];
}

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = { Search, FileText, PenTool, Globe, LayoutGrid, CheckCircle, Box };
  return icons[iconName] || FileText;
};

export function HomeQuickActions({ actions }: HomeQuickActionsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
      {actions.map((action, i) => {
        const Icon = getIcon(action.iconName);
        return (
          <Link key={i} to={action.path} className="group">
            <Card className="h-full border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer rounded-[20px] bg-card">
              <CardContent className="p-4 md:p-5 flex flex-col items-start gap-3 h-full">
                <div className={`p-2.5 rounded-2xl ${action.bg}`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${action.color}`} strokeWidth={2.5} />
                </div>
                <div className="mt-0.5">
                  <h3 className="font-bold text-[0.85rem] md:text-[0.95rem] text-foreground group-hover:text-primary transition-colors leading-tight mb-1">{action.title}</h3>
                  <p className="text-[0.75rem] md:text-[0.8rem] text-muted-foreground font-medium leading-snug">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

