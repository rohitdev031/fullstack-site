import { apiClient } from './api';

export interface AIModel {
  name: string;
  iconName: string;
  iconColor: string;
}

export interface ComparisonResult {
  modelName: string;
  response: string;
  metrics: { label: string; value: string; color: string }[];
}

export interface CompareData {
  availableModels: AIModel[];
}

const MOCK_MODELS: AIModel[] = [
  { name: 'GPT-4o', iconName: 'GPT', iconColor: 'text-purple-600' },
  { name: 'Claude 3.5 Sonnet', iconName: 'Claude', iconColor: 'text-orange-600' },
  { name: 'Gemini 1.5 Pro', iconName: 'Gemini', iconColor: 'text-blue-600' },
  { name: 'Llama 3', iconName: 'Llama', iconColor: 'text-indigo-500' },
];

export const compareService = {
  getAvailableModels: async (): Promise<AIModel[]> => {
    return apiClient.get('/api/compare/models', MOCK_MODELS);
  },
  
  comparePrompt: async (prompt: string, models: string[]): Promise<ComparisonResult[]> => {
    // Generate mock results for the selected models
    const results = models.map(model => ({
      modelName: model,
      response: `This is a mock simulated response from ${model} for the prompt: "${prompt}".\n\nWhen the backend is connected, this will be replaced with real text generation output.`,
      metrics: [
        { label: 'Speed', value: '45 tokens/s', color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Cost', value: '$0.02 / 1K', color: 'text-amber-600 dark:text-amber-400' },
        { label: 'Reasoning', value: 'High', color: 'text-blue-600 dark:text-blue-400' }
      ]
    }));
    
    return apiClient.post('/api/compare/run', { prompt, models }, results);
  }
};
