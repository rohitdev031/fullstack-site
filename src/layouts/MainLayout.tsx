import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/features/search/components/SearchBar';

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground w-full relative overflow-hidden">
      
      {/* Figma Signature Premium Glowing Radial Background */}
      <div className="absolute top-[-10%] right-[-5%] w-200 h-150 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10 hidden md:block"></div>
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-transparent">
        {/* Mobile Top Navigation (hidden on desktop) */}
        <MobileNav />

        {/* Desktop Top Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 shrink-0 relative z-10">
          <SearchBar />
          <div className="flex items-center gap-4">
             <Button className={['bg-purple-100 hover:bg-purple-200', 'text-purple-700', 'h-9 px-4 rounded-full font-semibold shadow-none border-0 gap-1.5', 'dark:bg-purple-900/30', 'dark:text-purple-300', 'dark:hover:bg-purple-900/50'].join(' ')}>
               <Sparkles className="w-3.5 h-3.5" /> Upgrade
             </Button>
             <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 text-muted-foreground">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
             </Button>
             <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 text-muted-foreground">
               <Bell className="w-4 h-4" />
             </Button>
          </div>
        </header>
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
