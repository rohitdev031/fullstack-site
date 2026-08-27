import { apiClient } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
}

export interface ChatSuggestion {
  iconName: string;
  text: string;
  color: string;
}

// ----------------------------------------------------------------------
// MOCK DATA
// (The backend developer can delete this section when APIs are ready)
// ----------------------------------------------------------------------
const MOCK_HISTORY: ChatHistoryItem[] = [
  { id: '1', title: 'Quantum computing explained', date: 'Today' },
  { id: '2', title: 'Python prime number function', date: 'Today' },
  { id: '3', title: 'Latest AI trends 2024 summary', date: 'Yesterday' },
];

const MOCK_SUGGESTIONS: ChatSuggestion[] = [
  { iconName: 'Atom', text: 'Explain quantum computing in simple terms', color: 'text-purple-500' },
  { iconName: 'Code2', text: 'Write a Python function to check prime numbers', color: 'text-green-500' },
  { iconName: 'TrendingUp', text: 'Summarize the latest AI trends in 2024', color: 'text-orange-500' },
  { iconName: 'Target', text: 'Create a marketing strategy for a SaaS product', color: 'text-blue-500' },
];

const MOCK_AI_RESPONSE = "This is a mock response from the server. When the backend is connected, this text will be replaced by a real streaming response from the AI models.";

// ----------------------------------------------------------------------
// SERVICE METHODS
// ----------------------------------------------------------------------

export const chatService = {
  /**
   * Fetches the user's recent chat history for the sidebar.
   */
  getChatHistory: async (): Promise<ChatHistoryItem[]> => {
    return apiClient.get('/api/chats/history', MOCK_HISTORY);
  },

  /**
   * Fetches chat suggestions for the empty state.
   */
  getSuggestions: async (): Promise<ChatSuggestion[]> => {
    return apiClient.get('/api/chats/suggestions', MOCK_SUGGESTIONS);
  },

  /**
   * Sends a new message to the AI and gets a response.
   */
  sendMessage: async (message: string, options?: any): Promise<ChatMessage> => {
    const responsePayload: ChatMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content: MOCK_AI_RESPONSE,
      timestamp: new Date().toISOString()
    };
    
    return apiClient.post('/api/chats/message', { message, ...options }, responsePayload);
  }
};
