import { useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ----------------------------------------------------------------------
// 🛑 BACKEND INTEGRATION POINT: useAuth / Auth Service
// ----------------------------------------------------------------------
// TO THE BACKEND TEAM:
// 1. Replace this mock with your actual authentication logic.
// 2. Fetch the current user profile from e.g. GET /api/v1/auth/me
// ----------------------------------------------------------------------

const MOCK_USER: UserProfile = {
  id: 'usr_123',
  firstName: 'Alex',
  lastName: 'Smith',
  email: 'alex@example.com',
};

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Simulate fetching user from session/API
    setTimeout(() => {
      if (isMounted) {
        setUser(MOCK_USER);
        setIsLoading(false);
      }
    }, 200);

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
