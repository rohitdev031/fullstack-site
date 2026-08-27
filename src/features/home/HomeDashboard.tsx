import { useState, useEffect } from 'react';
import { Search, FileText, PenTool, Globe, LayoutGrid, CheckCircle, Sparkles, ChevronRight, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { homeService } from '@/services/homeService';
import type { DashboardData } from '@/services/homeService';

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = { Search, FileText, PenTool, Globe, LayoutGrid, CheckCircle, Box };
  return icons[iconName] || FileText;
};

export function HomeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await homeService.getDashboardData();
        setData(result);
      } catch {
        setError('Unable to load the dashboard.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-[50vh] text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-[50vh] text-center">
        <p className="text-muted-foreground">{error || 'No dashboard data is available.'}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto flex flex-col gap-10 pb-20 md:pb-10 pt-2 md:pt-4">

      {/* Welcome Message */}
      <div className="text-center flex flex-col items-center justify-center mb-0 md:mb-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2 md:mb-3 flex items-center gap-3">
          Good morning, Alex <span className="text-3xl md:text-4xl animate-wave origin-bottom-right">👋</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-[0.95rem] md:text-[1.05rem]">What would you like to do today?</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {data.quickActions.map((action, i) => {
          const Icon = getIcon(action.iconName);
          return (
            <Link key={i} to={action.path} className="group">
              <Card className="h-full border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer rounded-[20px] bg-white dark:bg-card">
                <CardContent className="p-4 md:p-5 flex flex-col items-start gap-3 h-full">
                  <div className={`p-2.5 rounded-2xl ${action.bg}`}>
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${action.color}`} strokeWidth={2.5} />
                  </div>
                  <div className="mt-0.5">
                    <h3 className="font-bold text-[0.85rem] md:text-[0.95rem] text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors leading-tight mb-1">{action.title}</h3>
                    <p className="text-[0.75rem] md:text-[0.8rem] text-slate-500 dark:text-slate-400 font-medium leading-snug">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recommended Section */}
      <div className="mt-0">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[0.95rem] md:text-lg font-bold text-slate-800 dark:text-slate-200">Recommended for you</h2>
          <Button variant="link" className="text-xs md:text-sm font-semibold text-blue-600 px-2 h-auto hover:no-underline">Why this?</Button>
        </div>

        <div className="bg-[#f5f3ff] dark:bg-purple-950/20 rounded-[20px] md:rounded-[24px] p-5 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 items-center border border-purple-100 dark:border-purple-900/30">

          {/* Left Text Side */}
          <div className="flex-1 flex flex-col items-start gap-3 md:gap-4">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none shadow-none font-bold text-[10px] md:text-xs px-2.5 py-0.5 md:px-3 md:py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" /> Recommended
            </Badge>
            <h3 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight max-w-sm mt-0.5 md:mt-1">
              Get the most accurate and up-to-date answers
            </h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-[0.85rem] md:text-[0.95rem] max-w-md leading-snug">
              Use Gemini Pro with web search for the latest information and deeper insights.
            </p>
            <Button className="mt-1 md:mt-2 bg-[#5b52f6] hover:bg-[#4b42d6] text-white w-full sm:w-auto h-9 md:h-11 px-5 md:px-6 rounded-xl text-[0.85rem] md:text-base font-semibold shadow-md gap-2">
              Start with this setup <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
          </div>

          {/* Right Cards Side */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3">
            <Card className="bg-white dark:bg-card border-none shadow-sm rounded-xl md:rounded-2xl flex flex-col justify-center p-3 md:p-4 min-h-17.5 md:min-h-22.5">
              <div className="flex items-center gap-2 md:gap-3">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#5b52f6] shrink-0" />
                <div>
                  <h4 className="font-bold text-[0.75rem] md:text-[0.85rem] text-slate-800 dark:text-slate-200 leading-none">Gemini Pro</h4>
                  <p className="text-[9px] md:text-[10px] font-medium text-slate-500 mt-1">Best for research & analysis</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white dark:bg-card border-none shadow-sm rounded-xl md:rounded-2xl flex flex-col justify-center p-3 md:p-4 min-h-17.5 md:min-h-22.5">
              <div className="flex items-center gap-2 md:gap-3">
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-[0.75rem] md:text-[0.85rem] text-slate-800 dark:text-slate-200 leading-none">Web Search</h4>
                  <p className="text-[9px] md:text-[10px] font-medium text-blue-600 mt-1">On</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white dark:bg-card border-none shadow-sm rounded-xl md:rounded-2xl flex flex-col justify-center p-3 md:p-4 min-h-17.5 md:min-h-22.5">
              <div className="flex items-center gap-2 md:gap-3">
                <LayoutGrid className="w-4 h-4 md:w-5 md:h-5 text-blue-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-[0.75rem] md:text-[0.85rem] text-slate-800 dark:text-slate-200 leading-none">Deep Analysis</h4>
                  <p className="text-[9px] md:text-[10px] font-medium text-blue-600 mt-1">On</p>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* Quick Start */}
      <div className="mt-0">
        <h2 className="text-[0.95rem] md:text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {data.quickStarts.map((start, i) => {
            const Icon = getIcon(start.iconName);
            return (
              <Card key={i} className="group border border-slate-200/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer rounded-[16px] md:rounded-[20px] bg-white dark:bg-card">
                <CardContent className="p-3 md:p-4 flex items-center justify-between gap-2.5 h-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${start.bg} dark:bg-muted`}>
                      <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${start.color}`} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <h3 className="font-bold text-[0.75rem] md:text-[0.85rem] text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors leading-tight">{start.title}</h3>
                      <p className="text-[0.65rem] md:text-[0.75rem] text-slate-500 dark:text-slate-400 font-medium mt-0.5 md:mt-1 leading-snug pr-2">{start.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors shrink-0" strokeWidth={3} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

    </div>
  );
}
