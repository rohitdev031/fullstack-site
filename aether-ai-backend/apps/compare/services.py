import time
import concurrent.futures
from django.db import transaction
from core.ai_providers.factory import get_provider_and_model
from .models import CompareSession, CompareResultItem
from apps.chats.models import AIModel
import logging

COMPARE_TIMEOUT_SECONDS = 15

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
    # 1. Deduplicate model_slugs while preserving order
    unique_slugs = []
    for slug in model_slugs:
        if slug not in unique_slugs:
            unique_slugs.append(slug)

    # 2. Resolve all AIModel objects upfront and validate they exist/are active
    ai_models = []
    for slug in unique_slugs:
        try:
            model = AIModel.objects.get(slug=slug, is_active=True)
            ai_models.append(model)
        except AIModel.DoesNotExist:
            raise ValueError(f"Model '{slug}' not found or is not active.")

    # 3. Create CompareSession — atomic to ensure session exists before results
    with transaction.atomic():
        compare_session = CompareSession.objects.create(prompt=prompt)

    # We will instantiate providers inside the worker function

    # Define the worker function
    def fetch_model_response(ai_model):
        try:
            # We can introduce a timeout inside the future if needed, but requests can also handle it.
            provider, api_model_id = get_provider_and_model(ai_model)
            api_result = provider.generate_response(
                prompt=prompt,
                api_model_id=api_model_id
            )
            return {
                'ai_model': ai_model,
                'status': 'completed',
                'response_text': api_result['content'],
                'latency_ms': api_result['latency_ms'],
                'token_count': api_result['token_count']
            }
        except Exception as e:
            return {
                'ai_model': ai_model,
                'status': 'failed',
                'response_text': f"Error: {str(e)}",
                'latency_ms': None,
                'token_count': None
            }

    # 4. Run each model concurrently
    fetched_data = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(ai_models)) as executor:
        # Submit all tasks
        future_to_model = {executor.submit(fetch_model_response, model): model for model in ai_models}
        
        # Gather results (we want to preserve original order, so we map over ai_models)
        # However, to preserve order easily, we can just look up the futures in order.
        for model in ai_models:
            # Find the future for this model
            future = next(f for f, m in future_to_model.items() if m == model)
            try:
                # timeout per requirement/best practice
                data = future.result(timeout=COMPARE_TIMEOUT_SECONDS)
                fetched_data.append(data)
            except concurrent.futures.TimeoutError:
                fetched_data.append({
                    'ai_model': model,
                    'status': 'failed',
                    'response_text': "Error: Model generation timed out.",
                    'latency_ms': None,
                    'token_count': None
                })
            except Exception as e:
                fetched_data.append({
                    'ai_model': model,
                    'status': 'failed',
                    'response_text': f"Error: {str(e)}",
                    'latency_ms': None,
                    'token_count': None
                })

    # 5. Persist the results sequentially to avoid DB lock issues
    results = []
    for data in fetched_data:
        item = CompareResultItem.objects.create(
            compare_session=compare_session,
            model=data['ai_model'],
            response_text=data['response_text'],
            latency_ms=data['latency_ms'],
            token_count=data['token_count'],
            status=data['status']
        )
        
        results.append({
            'id': item.id,
            'model_slug': data['ai_model'].slug,
            'response': data['response_text'],
            'latency_ms': data['latency_ms'],
            'token_count': data['token_count'],
            'status': data['status'],
        })

    return {
        'compare_session_id': str(compare_session.id),
        'prompt': prompt,
        'results': results,
    }

