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
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const data = await searchService.search(query);
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce delay

    return () => clearTimeout(timer);
  }, [query]);

  return {
    query,
    setQuery,
    results: query.trim() ? results : [],
    isSearching: query.trim() ? isSearching : false,
    error: query.trim() ? error : null
  };
}
