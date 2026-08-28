import { createContext } from 'react';
import { type ModelId } from '@/features/ask/types';

export type AppContextType = {
    currentModel: ModelId;
    setCurrentModel: (model: ModelId) => void;
    webSearchEnabled: boolean;
    setWebSearchEnabled: (enabled: boolean) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);