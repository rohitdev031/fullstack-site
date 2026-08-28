import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Plus, Bell, MessageSquare } from 'lucide-react';
import { mainNavLinks } from './NavigationLinks';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { chatService } from '@/services/chatService';
import type { ChatHistoryItem } from '@/services/chatService';

export function MobileNav() {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await chatService.getChatHistory();
      setHistory(data);
    };
    fetchHistory();
  }, []);

  return (
    <header className="md:hidden flex items-center justify-between px-4 border-b bg-background sticky top-0 z-50 h-14">

      {/* Left: Hamburger */}
      <div className="flex-1 flex justify-start">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="shrink-0 -ml-2" />}>
            <Menu className="w-6 h-6 text-foreground" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:w-[320px] flex flex-col p-0 bg-background border-r-border">
            <SheetHeader className="p-4 text-center border-b border-border/50 relative flex flex-row items-center justify-center">
              <SheetTitle className="flex items-center gap-2 text-foreground text-lg tracking-tight font-bold mx-auto">
                <img src="/logo.jpg" alt="Aether" className="w-6 h-6 rounded-md object-cover" />
                Aether AI
              </SheetTitle>
            </SheetHeader>

            <div className="p-4">
              <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4" />
                New Conversation
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
              {mainNavLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-sidebar text-sidebar-foreground shadow-sm'
                      : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground'
                    }`
                  }
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </NavLink>
              ))}

              <div className="my-4 border-t border-border/50"></div>

              {/* Recent Chats Section */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="px-3 mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Chats</h3>
                </div>
                <div className="flex flex-col gap-0.5">
                  {history.map((chat) => (
                    <Button
                      key={chat.id}
                      variant="ghost"
                      className="w-full justify-start h-auto py-2.5 px-3 font-normal text-sm group"
                    >
                      <MessageSquare className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                      <div className="flex flex-col items-start truncate">
                        <span className="truncate w-full text-left">{chat.title}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* User Profile Mobile */}
            <div className="p-4 border-t border-border/50 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3 px-2">
                <Avatar className="w-9 h-9 bg-primary/20 text-primary">
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Alex Carter</span>
                  <span className="text-xs text-muted-foreground">Free Plan</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Center: Logo */}
      <div className="flex items-center justify-center gap-2 font-bold text-[17px] tracking-tight shrink-0">
        <img src="/logo.jpg" alt="Aether" className="w-6 h-6 rounded-md object-cover" />
        <span className="text-foreground">Aether AI</span>
      </div>

      {/* Right: Action */}
      <div className="flex-1 flex justify-end">
        <Button variant="ghost" size="icon" className="-mr-2 text-muted-foreground hover:bg-muted/50">
          <Bell className="w-5 h-5" />
        </Button>
      </div>

    </header>
  );
}
