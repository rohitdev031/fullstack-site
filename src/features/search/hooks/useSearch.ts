import { useState, useEffect } from 'react';
import { searchService, type SearchResult } from '@/services/searchService';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    let isActive = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const data = await searchService.search(query);
        if (isActive) {
          setResults(data);
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err : new Error('Search failed'));
        }
      } finally {
        if (isActive) {
          setIsSearching(false);
        }
      }
    }, 400); // 400ms debounce delay

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [query]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error
  };
}
