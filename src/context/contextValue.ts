import { createContext } from 'react';
import { type ModelId } from '@/features/ask/types';
import type { ChatHistoryItem } from '@/services/chatService';

export type AppContextType = {
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  currentModel: ModelId;
  setCurrentModel: (model: ModelId) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  history: ChatHistoryItem[];
  setHistory: (history: ChatHistoryItem[]) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);