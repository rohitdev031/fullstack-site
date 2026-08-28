export type ResponseQuality = 'Fast' | 'Balanced' | 'Best';

export const RESPONSE_QUALITIES: ResponseQuality[] = ['Fast', 'Balanced', 'Best'];

export type ModelId = 'gemini-1.5-pro' | 'gpt-4o' | 'claude-3.5-sonnet';

export const AVAILABLE_MODELS: { id: ModelId; name: string }[] = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
];

export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
};
