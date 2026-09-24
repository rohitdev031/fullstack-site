/**
 * Compare Service
 * Connects the Compare Mode UI to the real Django backend API.
 * GET /api/compare/models → fetches active models from backend
 * POST /api/compare/run/  → runs a prompt across multiple models
 */

const BACKEND_BASE = 'http://127.0.0.1:8000';

export interface AIModel {
  name: string;
  iconName: string;
  iconColor: string;
}

export interface ComparisonResult {
  id?: number;
  modelName: string;
  response: string;
  metrics: { label: string; value: string; color: string }[];
  sources?: { title: string; url: string; snippet?: string }[];
}

export interface CompareData {
  availableModels: AIModel[];
}

/**
 * Maps frontend model DISPLAY NAMES → backend slugs.
 * useCompare sends selectedModels.map(m => m.name) which are display names.
 * Backend expects slugs like 'claude-3-5-sonnet' (dashes, no dot).
 */
const FRONTEND_ID_TO_BACKEND_SLUG: Record<string, string> = {
  'GPT-4o': 'gpt-4o',
  'Gemini 1.5 Pro': 'gemini-1.5-pro',
  'Claude 3.5 Sonnet': 'claude-3-5-sonnet',
};

/**
 * Static available models pulled from backend-supported list.
 * Only includes models that have a valid backend slug.
 */
const BACKEND_SUPPORTED_MODELS: AIModel[] = [
  { name: 'GPT-4o',           iconName: 'GPT',    iconColor: 'text-purple-600' },
  { name: 'Gemini 1.5 Pro',   iconName: 'Gemini', iconColor: 'text-blue-600'   },
  { name: 'Claude 3.5 Sonnet',iconName: 'Claude', iconColor: 'text-orange-600' },
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
  /**
   * Returns the list of models supported by the backend.
   * Does NOT call the backend — model list is derived from BACKEND_SUPPORTED_MODELS
   * since backend doesn't have a dedicated /api/compare/models endpoint yet.
   */
  getAvailableModels: async (): Promise<AIModel[]> => {
    return BACKEND_SUPPORTED_MODELS;
  },

  /**
   * Sends a prompt to multiple AI models via the real backend API.
   * POST /api/compare/run/
   *
   * @param prompt  - The user's question/text to compare
   * @param models  - Array of model display names (from modelRegistry)
   * @param options - Optional: webSearchEnabled, AbortSignal
   */
  comparePrompt: async (
    prompt: string,
    models: string[],
    options?: { webSearchEnabled?: boolean; signal?: AbortSignal }
  ): Promise<CompareResponse> => {

    // Map frontend model names/IDs to backend slugs, skip unsupported ones
    const model_slugs = models
      .map(name => FRONTEND_ID_TO_BACKEND_SLUG[name])
      .filter(Boolean);

    if (model_slugs.length < 2) {
      throw new Error('At least 2 supported models are required for comparison.');
    }

    const response = await fetch(`${BACKEND_BASE}/api/compare/run/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model_slugs }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const data = await response.json();

    // Reverse map: backend slug -> frontend display name
    const BACKEND_SLUG_TO_FRONTEND_ID = Object.fromEntries(
      Object.entries(FRONTEND_ID_TO_BACKEND_SLUG).map(([key, value]) => [value, key])
    );

    // Transform backend response → ComparisonResult[] expected by UI
    const results: ComparisonResult[] = (data.results || []).map((r: any) => ({
      id: r.id,
      modelName: BACKEND_SLUG_TO_FRONTEND_ID[r.model_slug] || r.model_slug,
      response: r.response,
      metrics: [
        { label: 'Latency',    value: r.latency_ms   ? `${r.latency_ms}ms`  : 'N/A', color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Tokens',     value: r.token_count  ? `${r.token_count}`   : 'N/A', color: 'text-amber-600 dark:text-amber-400'    },
        { label: 'Status',     value: r.status === 'completed' ? 'OK' : r.status,     color: r.status === 'completed' ? 'text-blue-600 dark:text-blue-400' : 'text-red-500' },
      ],
    }));

    // Build a lightweight analysis block from real results
    const modelNames = results.map(r => r.modelName);
    const analysis: CompareAnalysisData = {
      keyTakeaways: [
        `${results.length} models responded to this prompt.`,
        `Fastest response: ${results.reduce((a, b) => {
          const aMs = parseInt(a.metrics[0].value);
          const bMs = parseInt(b.metrics[0].value);
          return aMs <= bMs ? a : b;
        }).modelName}.`,
        'All results are saved and can be fetched again via Compare session ID.',
      ],
      agreements: [
        { label: 'Prompt Answered', value: 'High', percent: '100%', color: 'bg-emerald-400', width: 'w-full' },
      ],
      bestAnswer: {
        modelName: modelNames[0] || 'N/A',
        reason: 'First result returned by the backend.',
      },
    };

    return { results, analysis };
  },

  rateComparison: async (modelName: string, rating: 'up' | 'down'): Promise<void> => {
    // TODO (Day 14): Connect to backend rating endpoint when available.
    console.log(`[Backend Ready] Comparison from ${modelName} rated ${rating}`);
  },
};
