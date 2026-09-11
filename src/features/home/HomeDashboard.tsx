import { useHomeDashboard } from './hooks/useHomeDashboard';
import { HomeWelcome } from './components/HomeWelcome';
import { HomeQuickActions } from './components/HomeQuickActions';
import { HomeRecommended } from './components/HomeRecommended';
import { HomeQuickStarts } from './components/HomeQuickStarts';

export function HomeDashboard() {
  const { data, isLoading } = useHomeDashboard();

  if (isLoading || !data) {
    return <div className="flex items-center justify-center h-[50vh] text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-300 mx-auto flex flex-col gap-10 pb-20 md:pb-10 pt-2 md:pt-4">
      <HomeWelcome />
      <HomeQuickActions actions={data.quickActions} />
      <HomeRecommended />
      <HomeQuickStarts starts={data.quickStarts} />
    </div>
  );
}
