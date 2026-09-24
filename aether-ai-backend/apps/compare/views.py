from rest_framework.views import APIView
from apps.chats.models import ChatMessage
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .services import run_compare_service
from .models import CompareSession, CompareResultItem


class CompareRunView(APIView):
    """
    POST /api/compare/run/
    Runs a prompt against multiple AI models and returns all results.
    Requires at least 2 model_slugs to make comparison meaningful.
    """
    # TODO (Day 14): Replace AllowAny with IsAuthenticated + ownership when JWT auth is active.
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        prompt = request.data.get('prompt')
        model_slugs = request.data.get('model_slugs')

        # --- Input Validation ---
        if not prompt or not str(prompt).strip():
            return Response(
                {"error": "The 'prompt' field is required and cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not model_slugs or not isinstance(model_slugs, list):
            return Response(
                {"error": "The 'model_slugs' field is required and must be a list."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(model_slugs) < 2:
            return Response(
                {"error": "At least 2 model_slugs are required to run a comparison."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Service Call ---
        try:
            result = run_compare_service(
                prompt=str(prompt).strip(),
                model_slugs=model_slugs
            )
            return Response(result, status=status.HTTP_201_CREATED)

        except ValueError as e:
            # Raised by service when a model_slug is invalid or inactive
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "An internal server error occurred while running the comparison."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CompareResultView(APIView):
    """
    GET /api/compare/<compare_session_id>/
    Fetches a previously run comparison session and all its model results.
    """
    # TODO (Day 14): Add ownership validation when JWT auth is active.
    permission_classes = [AllowAny]

    def get(self, request, compare_session_id, *args, **kwargs):
        try:
            session = CompareSession.objects.get(id=compare_session_id)
        except CompareSession.DoesNotExist:
            return Response(
                {"error": "Compare session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        results = CompareResultItem.objects.filter(
            compare_session=session
        ).select_related('model').order_by('created_at')

        return Response({
            "compare_session_id": str(session.id),
            "prompt": session.prompt,
            "created_at": session.created_at.isoformat(),
            "results": [
                {
                    "id": r.id,
                    "model_slug": r.model.slug,
                    "response": r.response_text,
                    "latency_ms": r.latency_ms,
                    "token_count": r.token_count,
                    "status": r.status,
                    "user_rating": r.user_rating,
                }
                for r in results
            ]
        }, status=status.HTTP_200_OK)


class CompareFromMessageView(APIView):
    """
    POST /api/compare/from-message/<uuid:message_id>/
    Integration endpoint: starts a comparison from an existing ChatMessage.

    - If the message role is 'user': uses its own content as the prompt.
    - If the message role is 'assistant': extracts the parent user message content as the prompt.
    - Passes extracted prompt to run_compare_service (reuses Day 5 logic entirely).
    - Returns same response format as CompareRunView (201 Created with results).
    """
    # TODO (Day 14): Add ownership validation (verify client_token owns the session) when JWT auth is active.
    permission_classes = [AllowAny]

    def post(self, request, message_id, *args, **kwargs):
        model_slugs = request.data.get('model_slugs')

        # --- Validate model_slugs ---
        if not model_slugs or not isinstance(model_slugs, list):
            return Response(
                {"error": "The 'model_slugs' field is required and must be a list."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(model_slugs) < 2:
            return Response(
                {"error": "At least 2 model_slugs are required to run a comparison."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Fetch the ChatMessage ---
        try:
            message = ChatMessage.objects.select_related('parent_message').get(id=message_id)
        except ChatMessage.DoesNotExist:
            return Response(
                {"error": "Chat message not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # --- Extract the prompt based on message role ---
        if message.role == 'user':
            # Directly use this message's content as the prompt
            prompt = message.content

        elif message.role == 'assistant':
            # The user's original prompt is the parent message
            if not message.parent_message:
                return Response(
                    {"error": "Assistant message has no parent user message to extract prompt from."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            prompt = message.parent_message.content

        else:
            # 'system' messages are not supported as a compare source
            return Response(
                {"error": "Cannot start a comparison from a system message."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Run comparison using existing Day 5 service ---
        try:
            result = run_compare_service(
                prompt=prompt,
                model_slugs=model_slugs
            )
            # Include the source message info for traceability
            result['source_message_id'] = str(message_id)
            result['source_message_role'] = message.role
            return Response(result, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception:
            return Response(
                {"error": "An internal server error occurred while running the comparison."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
