import { useAuth } from '@/features/auth/hooks/useAuth';
import { getGreeting } from '@/lib/getGreeting';

export function HomeWelcome() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const firstName = user?.firstName || 'Guest';

  return (
    <div className="text-center flex flex-col items-center justify-center mb-0 md:mb-2">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2 md:mb-3 flex items-center gap-3">
        {greeting}, {firstName} <span className="text-3xl md:text-4xl animate-wave origin-bottom-right">👋</span>
      </h1>
      <p className="text-muted-foreground font-medium text-[0.95rem] md:text-[1.05rem]">What would you like to do today?</p>
    </div>
  );
}
