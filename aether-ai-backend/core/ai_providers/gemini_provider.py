import time
from typing import Generator, Dict, Any
from django.conf import settings
from .base import BaseAIProvider

from google import genai
from google.genai import types


class GeminiProvider(BaseAIProvider):
    """
    Official Google GenAI Provider.
    """

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def generate_response(self, prompt: str, api_model_id: str, system_prompt: str = "") -> Dict[str, Any]:
        start_time = time.time()
        
        config = types.GenerateContentConfig(
            system_instruction=system_prompt if system_prompt else None
        )
        
        response = self.client.models.generate_content(
            model=api_model_id,
            contents=prompt,
            config=config,
        )
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Approximate token count since we are not using the countTokens API explicitly here
        # or checking response.usage_metadata.total_token_count if available
        token_count = 0
        if hasattr(response, 'usage_metadata') and response.usage_metadata:
            token_count = getattr(response.usage_metadata, 'total_token_count', 0)
        
        return {
            "content": response.text,
            "model_slug": api_model_id,
            "latency_ms": latency_ms,
            "token_count": token_count
        }

    def stream_response(self, prompt: str, api_model_id: str, system_prompt: str = "") -> Generator[str, None, None]:
        config = types.GenerateContentConfig(
            system_instruction=system_prompt if system_prompt else None
        )
        
        response_stream = self.client.models.generate_content_stream(
            model=api_model_id,
            contents=prompt,
            config=config,
        )
        
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text
