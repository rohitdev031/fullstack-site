import time
import random
from typing import Generator, Dict, Any
from .base import BaseAIProvider


class MockAIProvider(BaseAIProvider):
    """
    Dynamic Mock AI Provider for local testing without external API key charges.
    Simulates both full completions and real-time token streaming.
    """

    def generate_response(self, prompt: str, model_slug: str, system_prompt: str = "") -> Dict[str, Any]:
        start_time = time.time()
        text = f"This is a simulated AI response for prompt: '{prompt[:50]}' using model [{model_slug}]."
        latency_ms = int((time.time() - start_time) * 1000) + random.randint(150, 400)
        token_count = len(text.split())

        return {
            "content": text,
            "model_slug": model_slug,
            "latency_ms": latency_ms,
            "token_count": token_count
        }

    def stream_response(self, prompt: str, model_slug: str, system_prompt: str = "") -> Generator[str, None, None]:
        response_text = (
            f"Here is a real-time streamed response from [{model_slug}] for your prompt: '{prompt}'. "
            f"Aether AI Chat streams responses token-by-token for high performance and smooth user experience."
        )
        words = response_text.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            time.sleep(0.04)  # Simulate real-time token generation latency
            yield chunk
