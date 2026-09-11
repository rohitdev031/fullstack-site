import { apiClient } from './api';
import type { AetherFile } from './fileService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  sources?: { title: string; url: string; snippet?: string }[];
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
let MOCK_HISTORY: ChatHistoryItem[] = [
  { id: '1', title: 'Quantum computing explained', date: 'Today' },
  { id: '2', title: 'Python prime number function', date: 'Today' },
  { id: '3', title: 'Latest AI trends 2024 summary', date: 'Yesterday' },
];

const EXTENDED_MOCK_HISTORY: ChatHistoryItem[] = [
  { id: '4', title: 'How to center a div in CSS', date: 'Previous 7 Days' },
  { id: '5', title: 'Next.js 14 App Router vs Pages', date: 'Previous 7 Days' },
  { id: '6', title: 'Best practices for REST APIs', date: 'Previous 7 Days' },
  { id: '7', title: 'Explain the theory of relativity', date: 'Previous 30 Days' },
  { id: '8', title: 'Healthy dinner recipes under 30m', date: 'Previous 30 Days' },
  { id: '9', title: 'How to negotiate a salary', date: 'Previous 30 Days' },
  { id: '10', title: 'Learning Rust coming from JS', date: 'Previous 30 Days' },
];

let MOCK_MESSAGES_DB: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1_1', role: 'user', content: 'Explain quantum computing in simple terms', timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: 'm1_2', role: 'ai', content: 'Quantum computing is a type of computing that uses quantum mechanics to perform operations on data faster than classical computers. Unlike classical bits (0 or 1), quantum bits (qubits) can exist in multiple states simultaneously.', timestamp: new Date(Date.now() - 55000).toISOString() }
  ],
  '2': [
    { id: 'm2_1', role: 'user', content: 'Write a Python function to check prime numbers', timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: 'm2_2', role: 'ai', content: '```python\ndef is_prime(n):\n    if n <= 1:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n```', timestamp: new Date(Date.now() - 55000).toISOString() }
  ],
  '3': [
    { id: 'm3_1', role: 'user', content: 'Summarize the latest AI trends in 2024', timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: 'm3_2', role: 'ai', content: 'In 2024, AI trends are dominated by multimodal models, agentic workflows, and highly efficient smaller models running locally on edge devices.', timestamp: new Date(Date.now() - 55000).toISOString() }
  ]
};

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

export interface SendMessageOptions {
  chatId?: string | null;
  currentModel?: string;
  webSearchEnabled?: boolean;
  responseQuality?: string;
  attachedFile?: File | AetherFile | null;
}

export const chatService = {
  /**
   * Fetches the user's recent chat history for the sidebar (collapsed view).
   */
  getChatHistory: async (): Promise<ChatHistoryItem[]> => {
    return MOCK_HISTORY;
  },

  /**
   * Fetches the expanded chat history (View All).
   */
  getFullChatHistory: async (): Promise<ChatHistoryItem[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    // When backend ready: return apiClient.get('/api/chats/history?full=true');
    return [...MOCK_HISTORY, ...EXTENDED_MOCK_HISTORY];
  },

  /**
   * Fetches chat suggestions for the empty state.
   */
  getSuggestions: async (): Promise<ChatSuggestion[]> => {
    return apiClient.get('/api/chats/suggestions', MOCK_SUGGESTIONS);
  },



  /**
   * Fetches the full message history for a specific chat.
   */
  getChatMessages: async (chatId: string): Promise<ChatMessage[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // When backend is ready:
    // return apiClient.get(`/api/chats/${chatId}/messages`);
    
    // Mock response for testing
    return MOCK_MESSAGES_DB[chatId] || [];
  },

  /**
   * Sends a new message to the AI and gets a response.
   * If options.chatId is null, it simulates creating a new chat and returning a new chatId.
   */
  sendMessage: async (message: string, options?: SendMessageOptions): Promise<{ message: ChatMessage, chatId: string }> => {
    const responsePayload: ChatMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content: MOCK_AI_RESPONSE,
      timestamp: new Date().toISOString(),
      ...(options?.webSearchEnabled && {
        sources: [
          { title: 'LinkedIn - React Developer Guide', url: 'https://linkedin.com/pulse/react-guide' },
          { title: 'Wikipedia - Quantum Physics', url: 'https://en.wikipedia.org/wiki/Quantum' }
        ]
      })
    };
    
    const resultingChatId = options?.chatId || `chat_${Date.now()}`;

    // --- MOCK LOGIC START ---
    if (options?.attachedFile) {
      if ('id' in options.attachedFile) {
        console.log(`[Mock Backend] Reusing existing file: ${options.attachedFile.name} (ID: ${options.attachedFile.id})`);
      } else {
        console.log(`[Mock Backend] Received new file upload: ${options.attachedFile.name} (${options.attachedFile.size} bytes)`);
      }
    }

    if (!options?.chatId) {
       MOCK_HISTORY.unshift({ id: resultingChatId, title: message.substring(0, 30) + '...', date: 'Just now' });
       MOCK_MESSAGES_DB[resultingChatId] = [
         { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date().toISOString() },
         responsePayload
       ];
    } else {
       if (!MOCK_MESSAGES_DB[resultingChatId]) MOCK_MESSAGES_DB[resultingChatId] = [];
       MOCK_MESSAGES_DB[resultingChatId].push({ id: Date.now().toString(), role: 'user', content: message, timestamp: new Date().toISOString() });
       MOCK_MESSAGES_DB[resultingChatId].push(responsePayload);
    }
    // --- MOCK LOGIC END ---

    // When backend is ready:
    // const result = await apiClient.post('/api/chats/message', { message, ...options });
    // return { message: result.message, chatId: result.chatId };
    
    return { message: responsePayload, chatId: resultingChatId };
  },

  /**
   * Rates an AI message up or down.
   */
  rateMessage: async (messageId: string, rating: 'up' | 'down'): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // When backend is ready:
    // await apiClient.post(`/api/chats/message/${messageId}/rate`, { rating });
    console.log(`[Backend Ready] Message ${messageId} rated ${rating}`);
  },

  /**
   * Asks the AI to try generating a message again, replacing the old one.
   */
  regenerateMessage: async (messageId: string, type: 'standard' | 'improve', options?: SendMessageOptions): Promise<ChatMessage> => {
    // Simulate long generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`[Mock Backend] Regenerating message ${messageId} (${type})`, options);
    
    const responsePayload: ChatMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content: type === 'improve' 
        ? "Here is a much more detailed and comprehensive version of the previous response, drawing upon deeper insights and clearer examples...\n\n" + MOCK_AI_RESPONSE 
        : "Let me try explaining that in a different way.\n\n" + MOCK_AI_RESPONSE,
      timestamp: new Date().toISOString(),
      ...(options?.webSearchEnabled && {
        sources: [
          { title: 'Improved AI Source', url: 'https://example.com/ai' }
        ]
      })
    };

    // When backend is ready:
    // return apiClient.post(`/api/chats/message/${messageId}/regenerate`, { type, ...options });
    
    return responsePayload;
  }
};
