import time
from typing import Generator, Dict, Any
from django.conf import settings
from .base import BaseAIProvider

import anthropic


class AnthropicProvider(BaseAIProvider):
    """
    Official Anthropic Provider.
    """

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    def generate_response(self, prompt: str, api_model_id: str, system_prompt: str = "") -> Dict[str, Any]:
        start_time = time.time()
        
        kwargs = {
            "model": api_model_id,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}],
        }
        
        if system_prompt:
            kwargs["system"] = system_prompt
            
        response = self.client.messages.create(**kwargs)
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        token_count = 0
        if hasattr(response, 'usage') and response.usage:
            token_count = getattr(response.usage, 'input_tokens', 0) + getattr(response.usage, 'output_tokens', 0)
        
        return {
            "content": response.content[0].text,
            "model_slug": api_model_id,
            "latency_ms": latency_ms,
            "token_count": token_count
        }

    def stream_response(self, prompt: str, api_model_id: str, system_prompt: str = "") -> Generator[str, None, None]:
        kwargs = {
            "model": api_model_id,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}],
        }
        
        if system_prompt:
            kwargs["system"] = system_prompt

        with self.client.messages.stream(**kwargs) as stream:
            for text in stream.text_stream:
                yield text
