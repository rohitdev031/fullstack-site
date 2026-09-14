import { useState, useEffect } from 'react';
import { tipService, type Tip } from '@/services/tips/tipService';

export function useTip() {
  const [tip, setTip] = useState<Tip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchTip = async () => {
      try {
        const data = await tipService.getTip();
        if (mounted && data) {
          setTip(data);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Failed to load tip", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchTip();

    return () => { mounted = false; };
  }, []);

  const dismissTip = async () => {
    if (!tip) return;
    
    // Optimistically hide UI immediately so it feels snappy
    setIsVisible(false);
    
    try {
      await tipService.dismissTip(tip.id);
    } catch (error) {
      console.error("Failed to dismiss tip", error);
      // Optionally: setIsVisible(true) to show it again if the API failed
    }
  };

  return {
    tip,
    isVisible,
    isLoading,
    dismissTip
  };
}

