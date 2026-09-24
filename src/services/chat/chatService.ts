import { apiClient } from '@/services/api/client';
import { aiService } from '@/services/ai/aiService';
import type { AetherFile } from '@/services/files/fileService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  sources?: { title: string; url: string; snippet?: string }[];
  model_used?: string;
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



const MOCK_SUGGESTIONS: ChatSuggestion[] = [
  { iconName: 'Atom', text: 'Explain quantum computing in simple terms', color: 'text-purple-500' },
  { iconName: 'Code2', text: 'Write a Python function to check prime numbers', color: 'text-green-500' },
  { iconName: 'TrendingUp', text: 'Summarize the latest AI trends in 2024', color: 'text-orange-500' },
  { iconName: 'Target', text: 'Create a marketing strategy for a SaaS product', color: 'text-blue-500' },
];

// ----------------------------------------------------------------------
// SERVICE METHODS
// ----------------------------------------------------------------------

export interface SendMessageOptions {
  chatId?: string | null;
  currentModel?: string;
  webSearchEnabled?: boolean;
  responseQuality?: string;
  attachedFile?: File | AetherFile | null;
  documentId?: string;
  signal?: AbortSignal;
}

function formatDateCategory(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Calculate difference in days, resetting time to midnight for accurate day comparison
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((nowMidnight.getTime() - dateMidnight.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return 'Previous 7 Days';
  } else if (diffDays <= 30) {
    return 'Previous 30 Days';
  } else {
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }
}

async function fetchHistoryFromBackend(): Promise<ChatHistoryItem[]> {
  try {
    const clientToken = localStorage.getItem('x-client-token');
    const headers: Record<string, string> = {};
    if (clientToken) {
      headers['X-Client-Token'] = clientToken;
    }
    
    const response = await fetch('http://127.0.0.1:8000/api/chats/sessions/', {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      console.warn('Failed to fetch chat sessions, backend returned:', response.status);
      return [];
    }

    const data = await response.json();
    return data.map((session: any) => ({
      id: session.session_id,
      title: session.title,
      date: formatDateCategory(session.updated_at),
    }));
  } catch (error) {
    console.error('Network error fetching chat sessions:', error);
    return [];
  }
}

export const chatService = {
  /**
   * Fetches the user's recent chat history for the sidebar (collapsed view).
   */
  getChatHistory: async (): Promise<ChatHistoryItem[]> => {
    return fetchHistoryFromBackend();
  },

  /**
   * Fetches the expanded chat history (View All).
   */
  getFullChatHistory: async (): Promise<ChatHistoryItem[]> => {
    return fetchHistoryFromBackend();
  },

  /**
   * Fetches chat suggestions for the empty state.
   */
  getSuggestions: async (): Promise<ChatSuggestion[]> => {
    return MOCK_SUGGESTIONS;
  },

  /**
   * Recommends the best AI model for a given prompt using the backend API.
   */
  recommendModel: async (prompt: string): Promise<string | null> => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chats/recommend/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.recommended_model || null;
    } catch (error) {
      console.error('Failed to get model recommendation:', error);
      return null;
    }
  },



  /**
   * Fetches the full message history for a specific chat.
   */
  getChatMessages: async (chatId: string): Promise<ChatMessage[]> => {
    try {
      const clientToken = localStorage.getItem('x-client-token');
      const headers: Record<string, string> = {};
      if (clientToken) {
        headers['X-Client-Token'] = clientToken;
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/chats/sessions/${chatId}/history/`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        console.warn('Failed to fetch chat history, backend returned:', response.status);
        return [];
      }

      const data = await response.json();
      
      return (data.messages || []).map((msg: any) => ({
        id: msg.message_id,
        role: msg.role === 'assistant' ? 'ai' : msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        model_used: msg.model_used,
      }));
    } catch (error) {
      console.error('Network error fetching chat history:', error);
      return [];
    }
  },

  /**
   * Sends a new message to the AI and gets a response.
   * If options.chatId is null, it creates a new session in the backend.
   */
  sendMessage: async (message: string, options?: SendMessageOptions): Promise<{ message: ChatMessage, chatId: string }> => {
    let resultingChatId = options?.chatId;
    let clientToken = localStorage.getItem('x-client-token');

    // Create session if it doesn't exist
    if (!resultingChatId) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (clientToken) {
        headers['X-Client-Token'] = clientToken;
      }

      const sessionResponse = await fetch('http://127.0.0.1:8000/api/chats/sessions/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model_slug: options?.currentModel || 'gpt-4o',
          title: message.substring(0, 30) + '...'
        }),
        signal: options?.signal
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create chat session');
      }

      const sessionData = await sessionResponse.json();
      resultingChatId = sessionData.session_id;
      
      if (sessionData.client_token) {
        clientToken = sessionData.client_token;
        localStorage.setItem('x-client-token', clientToken);
      }
    }

    // Upload attached file if present
    let documentId: string | undefined;
    if (options?.attachedFile && options.attachedFile instanceof File) {
      const formData = new FormData();
      formData.append('file', options.attachedFile);
      formData.append('session_id', resultingChatId!);

      const uploadHeaders: Record<string, string> = {};
      if (clientToken) {
        uploadHeaders['X-Client-Token'] = clientToken;
      }

      const uploadResponse = await fetch('http://127.0.0.1:8000/api/documents/upload/', {
        method: 'POST',
        headers: uploadHeaders, // No Content-Type: browser sets multipart boundary automatically
        body: formData,
        signal: options?.signal
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload document. Please try again.');
      }

      const uploadData = await uploadResponse.json();
      documentId = uploadData.document_id;
    }

    // Delegate generation to the unified AI Service Layer
    const aiResponse = await aiService.generateChatResponse(message, { 
      ...options, 
      chatId: resultingChatId,
      clientToken: clientToken || undefined,
      documentId
    });

    return { message: aiResponse, chatId: resultingChatId! };
  },

  /**
   * Rates an AI message up or down.
   */
  rateMessage: async (messageId: string, rating: 'up' | 'down'): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`[Backend Ready] Message ${messageId} rated ${rating}`);
  },

  /**
   * Asks the AI to try generating a message again, replacing the old one.
   */
  regenerateMessage: async (messageId: string, type: 'standard' | 'improve', options?: SendMessageOptions): Promise<ChatMessage> => {
    // Delegate generation to the unified AI Service Layer
    return aiService.regenerateChatResponse(messageId, type, options);
  }
};

