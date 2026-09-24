import json
from django.db import transaction
from core.ai_providers.mock_provider import MockAIProvider
from core.ai_providers.factory import get_provider_and_model
from .models import ChatSession, ChatMessage, AIModel, AnonymousClient
from apps.documents.models import DocumentFile

def stream_chat_response_service(session_id: str, prompt: str, model_slug: str, client_token: str = None, parent_message_id: str = None, document_id: str = None):
    """
    Generator service that handles message persistence and streams real-time AI responses 
    to the frontend in standard SSE format.
    Ownership is validated via client_token (AnonymousClient) if provided.
    TODO (Day 14): Replace client_token ownership check with request.user check.
    """

    def _yield_error(msg: str):
        yield f"data: {json.dumps({'type': 'error', 'message': msg})}\n\n"

    # 1. Session Validation with Ownership Check
    try:
        session_filter = {'id': session_id}
        if client_token:
            session_filter['anonymous_client__client_token'] = client_token
        session = ChatSession.objects.get(**session_filter)
    except ChatSession.DoesNotExist:
        yield from _yield_error("Chat session not found or access denied.")
        return

    # Document Validation and Context Retrieval
    document_context = ""
    if document_id:
        try:
            document = DocumentFile.objects.get(id=document_id, session=session)
            if document.processing_status == 'failed':
                yield from _yield_error("The uploaded document failed to process correctly.")
                return
            if document.processing_status != 'completed':
                yield from _yield_error("The document is still processing. Please wait.")
                return
            document_context = document.extracted_text
        except DocumentFile.DoesNotExist:
            yield from _yield_error("Document not found or does not belong to this session.")
            return

    try:
        ai_model = AIModel.objects.get(slug=model_slug, is_active=True)
    except AIModel.DoesNotExist:
        yield from _yield_error("AI Model not found or inactive.")
        return

    parent_message = None
    if parent_message_id:
        try:
            parent_message = ChatMessage.objects.get(id=parent_message_id, session=session)
        except ChatMessage.DoesNotExist:
            yield from _yield_error("Parent message not found.")
            return

    # 2. User Message Persistence (Inside Atomic Transaction)
    try:
        with transaction.atomic():
            user_message = ChatMessage.objects.create(
                session=session,
                role='user',
                content=prompt,
                model_used=ai_model,
                parent_message=parent_message
            )
            # Update session's active model
            session.current_model = ai_model
            session.save(update_fields=['current_model', 'updated_at'])
    except Exception as e:
        yield from _yield_error(f"Failed to save user message: {str(e)}")
        return

    # 3. Dynamic History Retrieval 
    # Retrieve past messages for context (simple order by created_at)
    # Context limiting will be fully implemented at the provider integration level later.
    history_qs = ChatMessage.objects.filter(session=session).order_by('created_at')
    # Can build standard context array here if needed, passing simple prompt for now.

    # 4. Provider Invocation (Using step 1 interface)
    provider, api_model_id = get_provider_and_model(ai_model)
    
    # Construct AI Prompt internally
    ai_prompt = prompt
    if document_context:
        ai_prompt = f"Document Context:\n\n{document_context}\n\nUser Question: {prompt}"
    
    # 5. SSE Streaming
    full_response = ""
    try:
        stream = provider.stream_response(prompt=ai_prompt, api_model_id=api_model_id)
        for chunk in stream:
            full_response += chunk
            event_data = {
                "type": "chunk",
                "content": chunk
            }
            yield f"data: {json.dumps(event_data)}\n\n"
            
        # 6. Final Assistant Message Persistence
        # Save before emitting done so we can include the UUID
        assistant_msg = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=full_response,
            model_used=ai_model,
            parent_message=user_message
        )
        
        # Stream completed successfully
        yield f"data: {json.dumps({'type': 'done', 'message_id': str(assistant_msg.id)})}\n\n"

    except GeneratorExit:
        # Client disconnected during stream, do not persist assistant message.
        return
    except Exception as e:
        yield from _yield_error(f"Provider streaming error: {str(e)}")
        return


def smart_recommendation_service(prompt: str) -> dict:
    """
    Analyzes the user's prompt to recommend the best active AI model.
    Uses an extensible rule-based keyword logic for fast, zero-cost classification.
    """
    # Fetch available models from DB
    active_models = AIModel.objects.filter(is_active=True).values_list('slug', flat=True)
    active_models_set = set(active_models)
    
    prompt_lower = prompt.lower()
    
    # 1. Claude 3.5 Sonnet: Excellent for coding, creative writing, HTML/UI tasks
    claude_keywords = ['code', 'python', 'react', 'debug', 'html', 'css', 'javascript', 'ui', 'typescript', 'write a story', 'poem']
    if 'claude-3-5-sonnet' in active_models_set:
        if any(keyword in prompt_lower for keyword in claude_keywords):
            return {
                "recommended_model": "claude-3-5-sonnet",
                "reason": "Claude 3.5 Sonnet is highly effective for coding, development, and creative writing tasks."
            }

    # 2. Gemini 1.5 Pro: Excellent for extremely long context, document summarization
    gemini_keywords = ['summarize', 'document', 'article', 'analyze this text']
    if 'gemini-1.5-pro' in active_models_set:
        if len(prompt) > 1000 or any(keyword in prompt_lower for keyword in gemini_keywords):
            return {
                "recommended_model": "gemini-1.5-pro",
                "reason": "Gemini 1.5 Pro provides a large context window, making it ideal for summarizing or analyzing extensive text."
            }

    # 3. GPT-4o: Default Fallback. Excellent for math, complex logic, reasoning, or general tasks
    if 'gpt-4o' in active_models_set:
        return {
            "recommended_model": "gpt-4o",
            "reason": "GPT-4o is a versatile powerhouse, selected as the default for its strong general reasoning and logic capabilities."
        }
        
    # Ultimate fallback if GPT-4o is inactive but other models exist
    if active_models_set:
        fallback_slug = list(active_models_set)[0]
        return {
            "recommended_model": fallback_slug,
            "reason": f"{fallback_slug} is the available default model."
        }
        
    # If no active models exist in DB
    return {
        "recommended_model": None,
        "reason": "No active AI models found in the database."
    }

