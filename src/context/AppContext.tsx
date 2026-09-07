import { useState, type ReactNode } from 'react';
import { AppContext } from './contextValue';
import { type ModelId } from '@/features/ask/types';
import type { ChatHistoryItem } from '@/services/chatService';

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelId>('gemini-1.5-pro');
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);

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
