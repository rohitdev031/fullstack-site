import time
from django.db import transaction
from core.ai_providers.mock_provider import MockAIProvider
from .models import CompareSession, CompareResultItem
from apps.chats.models import AIModel


def run_compare_service(prompt: str, model_slugs: list) -> dict:
    """
    Runs a prompt against multiple AI models sequentially and persists all results.
    Returns a summary dict containing the session ID and all results.

    Args:
        prompt: The user's input text to compare across models.
        model_slugs: List of AIModel slugs to run the comparison on.

    Returns:
        dict with keys: compare_session_id, prompt, results (list of per-model results)
    """
    # 1. Resolve all AIModel objects upfront and validate they exist/are active
    ai_models = []
    for slug in model_slugs:
        try:
            model = AIModel.objects.get(slug=slug, is_active=True)
            ai_models.append(model)
        except AIModel.DoesNotExist:
            raise ValueError(f"Model '{slug}' not found or is not active.")

    # 2. Create CompareSession — atomic to ensure session exists before results
    with transaction.atomic():
        compare_session = CompareSession.objects.create(prompt=prompt)

    # 3. Run each model sequentially and persist the result
    provider = MockAIProvider()
    results = []

    for ai_model in ai_models:
        status = 'completed'
        response_text = ''
        latency_ms = None
        token_count = None

        try:
            api_result = provider.generate_response(
                prompt=prompt,
                model_slug=ai_model.slug
            )
            response_text = api_result['content']
            latency_ms = api_result['latency_ms']
            token_count = api_result['token_count']
            status = 'completed'

        except Exception as e:
            # If provider fails for one model, mark it as failed but continue
            response_text = f"Error: {str(e)}"
            status = 'failed'

        # Persist result for this model
        CompareResultItem.objects.create(
            compare_session=compare_session,
            model=ai_model,
            response_text=response_text,
            latency_ms=latency_ms,
            token_count=token_count,
            status=status
        )

        results.append({
            'model_slug': ai_model.slug,
            'response': response_text,
            'latency_ms': latency_ms,
            'token_count': token_count,
            'status': status,
        })

    return {
        'compare_session_id': str(compare_session.id),
        'prompt': prompt,
        'results': results,
    }
