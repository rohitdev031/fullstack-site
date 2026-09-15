import { StrictMode, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StrictMode>
      <BrowserRouter>
        <AppProvider>
          {children}
        </AppProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

