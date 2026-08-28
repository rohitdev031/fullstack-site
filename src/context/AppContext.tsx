import { useState, type ReactNode } from 'react';
import { type ModelId } from '@/features/ask/types';
import { AppContext } from './appContextValue';

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentModel, setCurrentModel] = useState<ModelId>('gemini-1.5-pro');
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);

  return (
    <AppContext.Provider value={{
      currentModel,
      setCurrentModel,
      webSearchEnabled,
      setWebSearchEnabled
    }}>
      {children}
    </AppContext.Provider>
  );
}
