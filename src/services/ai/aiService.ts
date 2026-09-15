import { apiClient } from '@/services/api/client';
import type { ChatMessage, SendMessageOptions } from '@/services/chat/chatService';
import type { CompareResponse, CompareAnalysisData, VerificationData } from './types';

// --- MOCK DATA ---
const MOCK_AI_RESPONSE = "This is a mock response from the server. When the backend is connected, this text will be replaced by a real streaming response from the AI models.";

const MOCK_VERIFICATION_DATA: VerificationData = {
  originalAnswer: {
    model: 'Gemini 1.5 Pro',
    text: 'Improving productivity while working from home requires a combination of environment design, routine management, and focus strategies. Key approaches include creating a dedicated workspace, establishing a consistent routine, using time blocking techniques, minimizing digital distractions, taking regular breaks, and setting clear boundaries between work and personal life.',
    sourcesCount: 5
  },
  metrics: {
    totalClaims: 10,
    correct: 7,
    partiallyCorrect: 2,
    incorrect: 1,
    accuracy: 80
  },
  claims: [
    { text: 'Creating a dedicated workspace improves productivity', status: 'Correct', details: 'Strong evidence from multiple studies', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Consistent routines help maintain productivity', status: 'Correct', details: 'Well-supported by research', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Time blocking techniques significantly increase productivity', status: 'Partially Correct', details: 'Effective for many, but varies by individual', iconName: 'AlertTriangle', color: 'text-amber-500' },
    { text: 'Digital distractions reduce productivity', status: 'Correct', details: 'Strong scientific consensus', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Taking regular breaks improves long-term productivity', status: 'Partially Correct', details: 'Depends on break frequency and type', iconName: 'AlertTriangle', color: 'text-amber-500' },
    { text: 'Setting boundaries between work and personal life is important', status: 'Correct', details: 'Well-established best practice', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Working longer hours from home leads to higher productivity', status: 'Incorrect', details: 'Overtime often reduces productivity', iconName: 'XCircle', color: 'text-red-500' },
    { text: 'Environment design affects focus and productivity', status: 'Correct', details: 'Supported by environmental psychology', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'Minimizing context switching improves productivity', status: 'Correct', details: 'Strong research support', iconName: 'CheckCircle2', color: 'text-emerald-500' },
    { text: 'All productivity techniques work equally for everyone', status: 'Partially Correct', details: 'Effectiveness varies by individual', iconName: 'AlertTriangle', color: 'text-amber-500' }
  ],
  keyIssues: [
    { priority: 'High', title: 'Overtime reduces productivity', description: 'Research shows overtime often leads to decreased productivity and burnout.', iconName: 'XCircle', colorClass: 'text-red-500', bgClass: 'bg-red-50' },
    { priority: 'Medium', title: 'Individual variation not addressed', description: 'Answer suggests one-size-fits-all approach when effectiveness varies by person.', iconName: 'AlertTriangle', colorClass: 'text-amber-500', bgClass: 'bg-amber-50' }
  ],
  recommendations: [
    'Consider adding individual differences',
    'Include flexibility in approach',
    'Add evidence for time blocking benefits'
  ],
  settings: {
    verificationModel: 'GPT-4o',
    webSearch: 'Enabled',
    factCheckingLevel: 'Standard'
  }
};

/**
 * AI Service Layer
 * Centralized service for orchestrating AI generation requests.
 */
export const aiService = {
  
  /**
   * ASK Feature: Generate a single chat response
   */
  generateChatResponse: async (message: string, options?: SendMessageOptions): Promise<ChatMessage> => {
    // We construct the payload here and pass it down to apiClient
    const payload = {
      message,
      model: options?.currentModel,
      webSearch: options?.webSearchEnabled,
      quality: options?.responseQuality,
      fileId: options?.attachedFile ? (options.attachedFile as any).id : undefined
    };

    const mockResponse: ChatMessage = {
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

    return apiClient.post('/api/ai/generate', payload, mockResponse, { signal: options?.signal });
  },

  /**
   * ASK Feature: Regenerate an existing message
   */
  regenerateChatResponse: async (messageId: string, type: 'standard' | 'improve', options?: SendMessageOptions): Promise<ChatMessage> => {
    const payload = { type, ...options };
    
    const mockResponse: ChatMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content: type === 'improve' 
        ? "Here is a much more detailed and comprehensive version of the previous response, drawing upon deeper insights and clearer examples...\n\n" + MOCK_AI_RESPONSE 
        : "Let me try explaining that in a different way.\n\n" + MOCK_AI_RESPONSE,
      timestamp: new Date().toISOString(),
      ...(options?.webSearchEnabled && {
        sources: [{ title: 'Improved AI Source', url: 'https://example.com/ai' }]
      })
    };

    return apiClient.post(`/api/ai/regenerate/${messageId}`, payload, mockResponse, { signal: options?.signal });
  },

  /**
   * COMPARE Feature: Run multiple models against a single prompt
   */
  runComparison: async (prompt: string, models: string[], options?: { webSearchEnabled?: boolean, signal?: AbortSignal }): Promise<CompareResponse> => {
    const mockResults = models.map(model => ({
      modelName: model,
      response: `This is a mock simulated response from ${model} for the prompt: "${prompt}".\n\nWhen the backend is connected, this will be replaced with real text generation output.`,
      metrics: [
        { label: 'Speed', value: '45 tokens/s', color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Cost', value: '$0.02 / 1K', color: 'text-amber-600 dark:text-amber-400' },
        { label: 'Reasoning', value: 'High', color: 'text-blue-600 dark:text-blue-400' }
      ],
      ...(options?.webSearchEnabled && {
        sources: [
          { title: 'Productivity Hacks', url: 'https://example.com/productivity' },
          { title: 'Remote Work Tips', url: 'https://example.com/remote' }
        ]
      })
    }));

    const mockAnalysis: CompareAnalysisData = {
      keyTakeaways: [
        "All models emphasize the importance of a dedicated workspace and consistent routine.",
        "Focus on minimizing distractions and managing energy levels.",
        "Regular breaks and boundaries are essential for long-term productivity."
      ],
      agreements: [
        { label: "Dedicated Workspace", value: "High", percent: "100%", color: "bg-emerald-400", width: "w-full" },
        { label: "Consistent Routine", value: "High", percent: "100%", color: "bg-emerald-400", width: "w-full" },
        { label: "Minimize Distractions", value: "High", percent: "100%", color: "bg-emerald-400", width: "w-full" },
        { label: "Regular Breaks", value: "Medium", percent: "67%", color: "bg-amber-400", width: "w-[67%]" },
        { label: "Health & Well-being", value: "High", percent: "100%", color: "bg-emerald-400", width: "w-full" }
      ],
      bestAnswer: {
        modelName: models.length > 1 ? models[1] : (models[0] || "GPT-4o"),
        reason: "Provides the most comprehensive and actionable strategies with a strong focus on systems and sustainable habits."
      }
    };

    const payload = { prompt, models, options };
    return apiClient.post('/api/ai/compare', payload, { results: mockResults, analysis: mockAnalysis }, { signal: options?.signal });
  },

  /**
   * VERIFY Feature: Run verification checks on content
   */
  runVerification: async (options?: { webSearchEnabled?: boolean, signal?: AbortSignal }): Promise<VerificationData> => {
    const responseData = { ...MOCK_VERIFICATION_DATA };
    
    if (options?.webSearchEnabled) {
      responseData.sources = [
        { title: 'The Eiffel Tower - Official Website', url: 'https://toureiffel.paris', domain: 'toureiffel.paris', icon: 'ShieldCheck' },
        { title: 'Wikipedia - Eiffel Tower', url: 'https://en.wikipedia.org', domain: 'wikipedia.org', icon: 'W' },
        { title: 'Paris History Archives', url: 'https://paris.fr', domain: 'paris.fr', icon: 'FileText' }
      ];
    }
    
    const payload = { options };
    return apiClient.post('/api/ai/verify', payload, responseData, { signal: options?.signal });
  }
};

