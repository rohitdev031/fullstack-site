import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, Plus, Bell, MessageSquare } from 'lucide-react';
import { mainNavLinks } from './NavigationLinks';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { chatService } from '@/services/chatService';
import type { ChatHistoryItem } from '@/services/chatService';
import { useAppContext } from '@/context/useAppContext';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentChatId, setCurrentChatId, history, setHistory } = useAppContext();

  useEffect(() => {
    // Only fetch initially if history is empty
    if (history.length === 0) {
      const fetchHistory = async () => {
        try {
          setError(null);
          const data = await chatService.getChatHistory();
          setHistory(data);
        } catch (err) {
          console.error("Failed to fetch initial mobile history:", err);
          setError("Failed to load history.");
        }
      };
      fetchHistory();
    }
  }, [history.length, setHistory]);

  const handleNewConversation = () => {
    setCurrentChatId(null);
    navigate('/ask');
    setIsOpen(false);
  };

  const handleHistoryItemClick = (chatId: string) => {
    setCurrentChatId(chatId);
    navigate('/ask');
    setIsOpen(false);
  };

  const handleToggleHistory = async () => {
    try {
      if (isHistoryExpanded) {
        setIsHistoryExpanded(false);
        // Fetch short history to collapse back
        const data = await chatService.getChatHistory();
        setHistory(data);
      } else {
        setIsLoadingHistory(true);
        const fullData = await chatService.getFullChatHistory();
        setHistory(fullData);
        setIsHistoryExpanded(true);
      }
    } catch (err) {
      console.error("Failed to toggle mobile history:", err);
      setError("Failed to load full history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Group history by date
  const groupedHistory = history.reduce((groups, chat) => {
    const dateGroup = chat.date || 'Older';
    if (!groups[dateGroup]) groups[dateGroup] = [];
    groups[dateGroup].push(chat);
    return groups;
  }, {} as Record<string, ChatHistoryItem[]>);

  return (
    <header className="md:hidden flex items-center justify-between px-4  bg-background sticky top-0 z-50 h-14">

      {/* Left: Hamburger */}
      <div className="flex-1 flex justify-start">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="shrink-0 -ml-2" />
          }>
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
              <Button
                onClick={handleNewConversation}
                className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4" />
                New Conversation
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
              {mainNavLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
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
              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col h-full">
                <div className="px-3 mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History</h3>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto pb-4 px-1">
                  {error ? (
                    <div className="text-center px-4 py-4 flex flex-col items-center gap-2">
                      <span className="text-xs text-red-500/80">{error}</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs bg-sidebar-accent border-sidebar-border" onClick={() => setHistory([])}>
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <>
                      {Object.entries(groupedHistory).map(([dateLabel, chats]) => (
                        <div key={dateLabel} className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold text-muted-foreground/70 px-2 mb-1 tracking-wider uppercase">{dateLabel}</span>
                          {chats.map((chat) => {
                            const isActiveChat = chat.id === currentChatId;
                            return (
                              <Button
                                key={chat.id}
                                variant="ghost"
                                onClick={() => handleHistoryItemClick(chat.id)}
                                className={`w-full justify-start h-auto py-2.5 px-3 font-normal text-sm group ${isActiveChat ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80 hover:text-foreground'}`}
                              >
                                <MessageSquare className={`w-4 h-4 mr-3 shrink-0 ${isActiveChat ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                <div className="flex flex-col items-start truncate">
                                  <span className="truncate w-full text-left">{chat.title}</span>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      ))}

                      <div
                        onClick={handleToggleHistory}
                        className={`text-xs text-muted-foreground hover:text-foreground px-4 py-2 mt-1 rounded-md hover:bg-muted/50 cursor-pointer transition-colors font-medium flex items-center gap-2 ${isLoadingHistory ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isLoadingHistory ? 'Loading...' : isHistoryExpanded ? 'Show Less' : 'View All'}
                      </div>
                    </>
                  )}
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
