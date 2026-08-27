/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';


type AppContextType = {
  currentModel: string;
  setCurrentModel: (model: string) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentModel, setCurrentModel] = useState('Gemini 1.5 Pro');
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

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
