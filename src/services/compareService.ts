import { apiClient } from '@/services/api/client';
import { aiService } from '@/services/ai/aiService';
import { AVAILABLE_MODELS, type ModelDefinition } from '@/services/ai/modelRegistry';
import type { CompareResponse } from '@/services/ai/types';

export const compareService = {
  getAvailableModels: async (options?: { signal?: AbortSignal }): Promise<ModelDefinition[]> => {
    return apiClient.get('/api/compare/models', AVAILABLE_MODELS, options);
  },
  
  comparePrompt: async (prompt: string, models: string[], options?: { webSearchEnabled?: boolean, signal?: AbortSignal }): Promise<CompareResponse> => {
    // Delegate to centralized AI Service Layer
    return aiService.runComparison(prompt, models, options);
  },

  rateComparison: async (modelName: string, rating: 'up' | 'down'): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // When backend is ready:
    // await apiClient.post(`/api/compare/rate`, { modelName, rating });
    console.log(`[Backend Ready] Comparison from ${modelName} rated ${rating}`);
  }
};

