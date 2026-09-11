import { useState, useEffect } from 'react';
import { homeService } from '@/services/homeService';
import type { DashboardData } from '@/services/homeService';

export function useHomeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await homeService.getDashboardData();
        if (isMounted) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading };
}
