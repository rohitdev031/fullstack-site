
export interface SearchResult {
  id: string;
  title: string;
  type: 'conversation' | 'document';
  date: string;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: '1', title: 'React Performance Tips', type: 'conversation', date: '2 hours ago' },
  { id: '2', title: 'Q3 Financial Report', type: 'document', date: 'Yesterday' },
  { id: '3', title: 'GraphQL vs REST analysis', type: 'conversation', date: 'Last week' },
  { id: '4', title: 'UI Design System Meeting', type: 'conversation', date: 'Oct 12' },
  { id: '5', title: 'API Authentication Spec', type: 'document', date: 'Oct 10' },
];

export const searchService = {
  /**
   * Performs a global search across conversations and documents.
   */
  search: async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock filtering based on query
    const filtered = MOCK_RESULTS.filter(r => r.title.toLowerCase().includes(query.toLowerCase()));

    // When backend is ready, uncomment this and delete the mock logic:
    // return apiClient.get('/api/search', { params: { q: query } }, filtered);
    return filtered;
  }
};
