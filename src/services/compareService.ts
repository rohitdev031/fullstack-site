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
  sources?: { title: string; url: string; snippet?: string }[];
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

export interface CompareAnalysisData {
  keyTakeaways: string[];
  agreements: { label: string; value: 'High' | 'Medium' | 'Low'; percent: string; color: string; width: string }[];
  bestAnswer: { modelName: string; reason: string };
}

export interface CompareResponse {
  results: ComparisonResult[];
  analysis: CompareAnalysisData;
}

export const compareService = {
  getAvailableModels: async (): Promise<AIModel[]> => {
    return apiClient.get('/api/compare/models', MOCK_MODELS);
  },

  comparePrompt: async (prompt: string, models: string[]): Promise<CompareResponse> => {
    // Generate mock results for the selected models
    const results = models.map(model => ({
      modelName: model,
      response: `This is a mock simulated response from ${model} for the prompt: "${prompt}".\n\nWhen the backend is connected, this will be replaced with real text generation output.`,
      metrics: [
        { label: 'Speed', value: '45 tokens/s', color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Cost', value: '$0.02 / 1K', color: 'text-amber-600 dark:text-amber-400' },
        { label: 'Reasoning', value: 'High', color: 'text-blue-600 dark:text-blue-400' }
      ],
      sources: [
        { title: 'Productivity Hacks', url: 'https://example.com/productivity' },
        { title: 'Remote Work Tips', url: 'https://example.com/remote' }
      ]
    }));

    const analysis: CompareAnalysisData = {
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

    return apiClient.post('/api/compare/run', { prompt, models }, { results, analysis });
  }
};
