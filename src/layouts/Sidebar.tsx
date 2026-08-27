import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Plus, PanelLeftClose, PanelLeftOpen, MessageSquare } from 'lucide-react';
import { mainNavLinks } from './NavigationLinks';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { chatService } from '@/services/chatService';
import type { ChatHistoryItem } from '@/services/chatService';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [historyError, setHistoryError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const data = await chatService.getChatHistory();
        if (isMounted) setHistory(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setHistoryError(true);
      }
    };
    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 z-50 overflow-hidden`}>

      {/* Logo & Toggle */}
      <div className="p-4 flex flex-col gap-5 mb-2 border-b border-sidebar-border/30 pb-6">
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-6 pt-2' : 'justify-between px-1'}`}>
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer">
            <img src="/logo.jpg" alt="Aether" className="w-7 h-7 rounded-md object-cover shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap animate-in fade-in duration-300">Aether AI</span>}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors shrink-0"
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>
        <Link to="/ask" className={isCollapsed ? "mx-auto" : ""}>
          <Button className={`bg-linear-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white border-0 shadow-md h-11 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'w-11 px-0 justify-center' : 'w-full justify-start gap-3 px-4'}`}>
            <Plus className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">New Conversation</span>}
          </Button>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2 flex flex-col gap-1">
        {mainNavLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            title={isCollapsed ? link.name : undefined}
            className={({ isActive }) =>
              `flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center mx-3 py-3 rounded-xl' : 'gap-3 pl-6 pr-4 py-3 border-l-4'} ${isActive
                ? (isCollapsed ? 'bg-sidebar-accent text-white' : 'bg-sidebar-accent/50 text-white border-primary')
                : (isCollapsed ? 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white' : 'border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-white')
              }`
            }
          >
            <link.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{link.name}</span>}
          </NavLink>
        ))}

        {/* History Section */}
        {!isCollapsed && (
          <div className="mt-4 pt-6 border-t border-sidebar-border/30 mb-2 animate-in fade-in duration-500">
            <h4 className="text-xs font-semibold text-sidebar-foreground/50 mb-3 px-7">History</h4>
            <div className="flex flex-col gap-0.5">
              {historyError && <p className="px-7 py-2 text-xs text-sidebar-foreground/60">Unable to load history.</p>}
              {history.map((chat, i) => (
                <div key={chat.id} className={`text-sm py-3 cursor-pointer flex items-center gap-3 overflow-hidden transition-colors ${i === 0 ? 'bg-primary/20 text-white border-l-4 border-primary pl-6 pr-4 font-medium' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-white border-l-4 border-transparent pl-6 pr-4'}`}>
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </div>
              ))}
              <div className="text-xs text-sidebar-foreground/50 hover:text-white pl-13 py-2.5 mt-1 cursor-pointer transition-colors font-medium">
                View All
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className={`p-4 flex flex-col gap-4 border-t border-sidebar-border/30 ${isCollapsed ? 'items-center' : ''}`}>

        {/* User Profile & Settings */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2 pt-2'}`}>
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 bg-primary/20 text-primary font-bold shrink-0">
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-medium truncate text-white">Alex Carter</span>
                <span className="text-xs text-sidebar-foreground/60 truncate">Free Plan</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button className="text-sidebar-foreground/60 hover:text-white transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          )}
        </div>
      </div>

    </aside>
  );
}
