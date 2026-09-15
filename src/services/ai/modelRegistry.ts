export type ModelId = 'gemini-1.5-pro' | 'gpt-4o' | 'claude-3.5-sonnet' | 'llama-3';

export interface ModelDefinition {
  id: ModelId;
  name: string;
  provider: 'Google' | 'OpenAI' | 'Anthropic' | 'Meta';
  capabilities: string[];
  iconName: string;
  iconColor: string;
}

export const AVAILABLE_MODELS: ModelDefinition[] = [
  { 
    id: 'gemini-1.5-pro', 
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    capabilities: ['chat', 'files', 'web-search'],
    iconName: 'Gemini',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o',
    provider: 'OpenAI',
    capabilities: ['chat', 'files', 'web-search'],
    iconName: 'GPT',
    iconColor: 'text-purple-600'
  },
  { 
    id: 'claude-3.5-sonnet', 
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    capabilities: ['chat', 'web-search'],
    iconName: 'Claude',
    iconColor: 'text-orange-600'
  },
  {
    id: 'llama-3',
    name: 'Llama 3',
    provider: 'Meta',
    capabilities: ['chat'],
    iconName: 'Llama',
    iconColor: 'text-indigo-500'
  }
];

export const getModelById = (id: string): ModelDefinition | undefined => {
  return AVAILABLE_MODELS.find(model => model.id === id);
};
