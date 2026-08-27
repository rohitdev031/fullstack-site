import { useState, useEffect } from 'react';
import { chatService } from '@/services/chatService';
import type { ChatSuggestion } from '@/services/chatService';

export function useChatSuggestions() {
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      try {
        const data = await chatService.getSuggestions();
        if (isMounted) setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setError('Unable to load suggestions.');
      }
    };
    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, []);

  return { suggestions, error };
}
