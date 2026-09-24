import time
from typing import Generator, Dict, Any
from django.conf import settings
from .base import BaseAIProvider

import openai


class OpenAIProvider(BaseAIProvider):
    """
    Official OpenAI Provider.
    """

    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    def generate_response(self, prompt: str, api_model_id: str, system_prompt: str = "") -> Dict[str, Any]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        start_time = time.time()
        
        response = self.client.chat.completions.create(
            model=api_model_id,
            messages=messages,
            stream=False,
        )
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        return {
            "content": response.choices[0].message.content,
            "model_slug": api_model_id,  # Keep mapping internal
            "latency_ms": latency_ms,
            "token_count": response.usage.total_tokens if response.usage else 0
        }

    def stream_response(self, prompt: str, api_model_id: str, system_prompt: str = "") -> Generator[str, None, None]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        stream = self.client.chat.completions.create(
            model=api_model_id,
            messages=messages,
            stream=True,
        )
        
        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
