import re
from typing import Dict, Any
from django.shortcuts import get_object_or_404
from apps.chats.models import ChatMessage, AIModel
from apps.compare.models import CompareResultItem, CompareSession
from core.ai_providers.factory import get_provider_and_model
from .models import VerifyReview

def parse_verdict(response_text: str) -> str:
    """
    Extracts the verdict from the AI response.
    Expected format: "VERDICT: [verified | conflicting | needs_review | inaccurate]"
    Falls back to 'needs_review' if not found or invalid.
    """
    match = re.search(r'VERDICT:\s*([a-zA-Z_]+)', response_text, re.IGNORECASE)
    if match:
        extracted = match.group(1).lower()
        valid_choices = [choice[0] for choice in VerifyReview.VERDICT_CHOICES]
        if extracted in valid_choices:
            return extracted
    return 'needs_review'

def run_verification_service(source_type: str, source_id, verifying_model_slug: str) -> VerifyReview:
    """
    Runs a factual verification on an existing AI answer.
    source_type: 'message' or 'compare'
    source_id: UUID string or int ID
    """
    verifying_model = get_object_or_404(AIModel, slug=verifying_model_slug, is_active=True)

    original_prompt = ""
    ai_answer = ""
    source_message = None
    source_compare_item = None

    if source_type == 'message':
        message = get_object_or_404(ChatMessage, id=source_id)
        if message.role != 'assistant':
            raise ValueError("Target message must be an assistant response.")
        if not message.parent_message or message.parent_message.role != 'user':
            raise ValueError("Assistant message must have a parent user message to verify against.")
        
        original_prompt = message.parent_message.content
        ai_answer = message.content
        source_message = message

    elif source_type == 'compare':
        compare_item = get_object_or_404(CompareResultItem, id=source_id)
        original_prompt = compare_item.compare_session.prompt
        ai_answer = compare_item.response_text
        source_compare_item = compare_item
    else:
        raise ValueError("Invalid source_type. Must be 'message' or 'compare'.")

    # Construct the strict prompt
    verification_prompt = (
        f"You are an expert fact-checker. Review the following AI answer to the user's prompt.\n\n"
        f"USER PROMPT:\n{original_prompt}\n\n"
        f"AI ANSWER:\n{ai_answer}\n\n"
        f"INSTRUCTIONS:\n"
        f"Start your response strictly with: 'VERDICT: [choice]'\n"
        f"Where [choice] is exactly one of: verified, conflicting, needs_review, inaccurate.\n"
        f"Then provide your reasoning."
    )

    # Call AI Provider
    provider, api_model_id = get_provider_and_model(verifying_model)
    response_data = provider.generate_response(prompt=verification_prompt, api_model_id=api_model_id)
    
    review_output = response_data.get('content', '')
    verdict = parse_verdict(review_output)

    # Persist the review
    review = VerifyReview.objects.create(
        source_message=source_message,
        source_compare_item=source_compare_item,
        verifying_model=verifying_model,
        verification_prompt=verification_prompt,
        review_output=review_output,
        verdict=verdict
    )

    return review
