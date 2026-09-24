from abc import ABC, abstractmethod
from typing import Generator, Dict, Any


class BaseAIProvider(ABC):
    """
    Abstract Base Class for all AI Providers (Gemini, OpenAI, Claude, Mock).
    Defines unified interfaces for both full completions and streaming responses.
    """

    @abstractmethod
    def generate_response(self, prompt: str, api_model_id: str, system_prompt: str = "") -> Dict[str, Any]:
        """
        Generate complete non-streaming AI response.
        Returns dict with keys: content, model_slug, latency_ms, token_count.
        """
        pass

    @abstractmethod
    def stream_response(self, prompt: str, api_model_id: str, system_prompt: str = "") -> Generator[str, None, None]:
        """
        Stream AI response token-by-token (chunk by chunk) as a Python generator.
        Yields text chunks in real-time.
        """
        pass
