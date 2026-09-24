from typing import Tuple
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from .base import BaseAIProvider
from .mock_provider import MockAIProvider
from .openai_provider import OpenAIProvider
from .gemini_provider import GeminiProvider
from .anthropic_provider import AnthropicProvider


# Central registry mapping DB model slugs to actual API model IDs
API_MODEL_MAPPING = {
    'gpt-4o': 'gpt-4o',
    'gemini-1.5-pro': 'gemini-1.5-pro',
    'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
}


def get_provider_and_model(ai_model) -> Tuple[BaseAIProvider, str]:
    """
    Given an AIModel instance from the database, returns the appropriate 
    Provider instance and the exact API model ID string.
    """
    # 1. Resolve actual API model string
    api_model_id = API_MODEL_MAPPING.get(ai_model.slug, ai_model.slug)
    
    # 2. Check if Mock AI is enabled
    if settings.USE_MOCK_AI:
        return MockAIProvider(), api_model_id
        
    # 3. Instantiate real providers
    if ai_model.provider == 'openai':
        if not getattr(settings, 'OPENAI_API_KEY', None):
            raise ImproperlyConfigured("OPENAI_API_KEY is missing in .env but USE_MOCK_AI is False.")
        return OpenAIProvider(), api_model_id
        
    elif ai_model.provider == 'google':
        if not getattr(settings, 'GEMINI_API_KEY', None):
            raise ImproperlyConfigured("GEMINI_API_KEY is missing in .env but USE_MOCK_AI is False.")
        return GeminiProvider(), api_model_id
        
    elif ai_model.provider == 'anthropic':
        if not getattr(settings, 'ANTHROPIC_API_KEY', None):
            raise ImproperlyConfigured("ANTHROPIC_API_KEY is missing in .env but USE_MOCK_AI is False.")
        return AnthropicProvider(), api_model_id
        
    # Fallback to Mock if provider not implemented yet
    return MockAIProvider(), api_model_id
