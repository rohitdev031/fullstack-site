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
  generateChatResponse: async (message: string, options?: SendMessageOptions & { clientToken?: string }): Promise<ChatMessage> => {
    const payload: any = {
      session_id: options?.chatId,
      prompt: message,
      model_slug: options?.currentModel || 'gpt-4o',
    };
    
    if (options?.documentId) {
      payload.document_id = options.documentId;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (options?.clientToken) {
        headers['X-Client-Token'] = options.clientToken;
      }

      const response = await fetch('http://127.0.0.1:8000/api/chats/stream/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: options?.signal
      });

      if (!response.ok) {
        throw new Error('Failed to generate chat response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let messageId = Date.now().toString();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (!dataStr.trim()) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'chunk') {
                fullText += data.content;
              } else if (data.type === 'done') {
                if (data.message_id) {
                  messageId = data.message_id;
                }
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Stream error');
              }
            } catch (e) {
              console.error("Error parsing chunk:", dataStr);
            }
          }
        }
      }

      return {
        id: messageId,
        role: 'ai',
        content: fullText,
        timestamp: new Date().toISOString(),
        ...(options?.webSearchEnabled && {
          sources: [
            { title: 'AI Assistant', url: '#' }
          ]
        })
      };

    } catch (error) {
      console.error("Chat generation error:", error);
      throw error;
    }
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
  runVerification: async (options?: { 
    messageId?: string;
    compareResultId?: number;
    webSearchEnabled?: boolean;
    signal?: AbortSignal 
  }): Promise<VerificationData> => {
    let endpoint = '';
    
    // Choose endpoint based on source
    if (options?.messageId) {
      endpoint = `/api/verify/from-message/${options.messageId}/`;
    } else if (options?.compareResultId) {
      endpoint = `/api/verify/from-compare/${options.compareResultId}/`;
    } else {
      // Fallback for UI if navigating without IDs (legacy/mock path)
      const responseData = { ...MOCK_VERIFICATION_DATA };
      if (options?.webSearchEnabled) {
        responseData.sources = [
          { title: 'The Eiffel Tower - Official Website', url: 'https://toureiffel.paris', domain: 'toureiffel.paris', icon: 'ShieldCheck' },
          { title: 'Wikipedia - Eiffel Tower', url: 'https://en.wikipedia.org', domain: 'wikipedia.org', icon: 'W' },
          { title: 'Paris History Archives', url: 'https://paris.fr', domain: 'paris.fr', icon: 'FileText' }
        ];
      }
      return new Promise(resolve => setTimeout(() => resolve(responseData), 1500));
    }

    const payload = { verifying_model_slug: 'gpt-4o' };
    
    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: options?.signal
      });

      if (!response.ok) {
        throw new Error('Verification backend failed');
      }

      const data = await response.json();
      
      // Transform backend Day 9 'verdict' and 'review_output' into VerificationData
      const verdict = data.verdict;
      const reviewOutput = data.review_output;
      
      const isCorrect = verdict === 'verified';
      const isPartiallyCorrect = verdict === 'needs_review' || verdict === 'conflicting';
      const isIncorrect = verdict === 'inaccurate';

      const responseData: VerificationData = {
        originalAnswer: {
          model: data.original_model_name || data.verifying_model_name || 'AI Model',
          text: data.original_answer_text || "Connected to real verification endpoint. The original answer text will be shown here in the future.",
          sourcesCount: 0
        },
        metrics: {
          totalClaims: 1,
          correct: isCorrect ? 1 : 0,
          partiallyCorrect: isPartiallyCorrect ? 1 : 0,
          incorrect: isIncorrect ? 1 : 0,
          accuracy: isCorrect ? 100 : 0
        },
        claims: [
          {
            text: reviewOutput,
            status: isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : 'Partially Correct',
            details: `Backend Verdict: ${verdict.toUpperCase()}`,
            iconName: isCorrect ? 'CheckCircle2' : isIncorrect ? 'XCircle' : 'AlertTriangle',
            color: isCorrect ? 'text-emerald-500' : isIncorrect ? 'text-red-500' : 'text-amber-500'
          }
        ],
        keyIssues: isIncorrect ? [
          {
            priority: 'High',
            title: 'Inaccurate Information Found',
            description: 'The verification model flagged the answer as inaccurate.',
            iconName: 'XCircle',
            colorClass: 'text-red-500',
            bgClass: 'bg-red-50'
          }
        ] : [],
        recommendations: [
          'Review the verification output provided in the claims above.'
        ],
        settings: {
          verificationModel: data.verifying_model_name || 'gpt-4o',
          webSearch: options?.webSearchEnabled ? 'Enabled' : 'Disabled',
          factCheckingLevel: 'Standard'
        }
      };
      
      return responseData;
    } catch (error) {
      console.error("Verification failed:", error);
      throw error;
    }
  }
};

