/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ModelId } from '@/services/ai/modelRegistry';
import type { ChatHistoryItem } from '@/services/chat/chatService';

type AppContextType = {
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  currentModel: ModelId;
  setCurrentModel: (model: ModelId) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  history: ChatHistoryItem[];
  setHistory: (history: ChatHistoryItem[]) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    return sessionStorage.getItem('currentChatId') || null;
  });
  const [currentModel, setCurrentModel] = useState<ModelId>('gemini-1.5-pro');
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);

  useEffect(() => {
    if (currentChatId) {
      sessionStorage.setItem('currentChatId', currentChatId);
    } else {
      sessionStorage.removeItem('currentChatId');
    }
  }, [currentChatId]);

  return (
    <AppContext.Provider value={{
      currentChatId,
      setCurrentChatId,
      currentModel,
      setCurrentModel,
      webSearchEnabled,
      setWebSearchEnabled,
      history,
      setHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}


