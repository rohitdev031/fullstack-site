import { useState, useEffect } from 'react';
import { HOME_CONFIG, type DashboardData } from '../homeConfig';

export function useHomeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We keep the state pattern so components don't have to change, but load it instantly
    setData(HOME_CONFIG);
    setIsLoading(false);
  }, []);

  return { data, isLoading };
}
