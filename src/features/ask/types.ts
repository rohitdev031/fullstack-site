export type ResponseQuality = 'Fast' | 'Balanced' | 'Best';

export const RESPONSE_QUALITIES: ResponseQuality[] = ['Fast', 'Balanced', 'Best'];

// ModelId and AVAILABLE_MODELS have been moved to @/services/ai/modelRegistry

export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
  sources?: { title: string; url: string }[];
};
