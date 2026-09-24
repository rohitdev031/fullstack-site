from rest_framework.views import APIView
from django.http import StreamingHttpResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .services import stream_chat_response_service, smart_recommendation_service
from .models import ChatSession, AIModel, AnonymousClient, ChatMessage


def _get_anonymous_client(request):
    """
    Helper: Extract X-Client-Token header and return matching AnonymousClient.
    Returns (AnonymousClient, None) on success, (None, error_response) on failure.
    """
    token = request.headers.get('X-Client-Token')
    if not token:
        error = Response(
            {"error": "X-Client-Token header is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
        return None, error
    try:
        client = AnonymousClient.objects.get(client_token=token)
        return client, None
    except (AnonymousClient.DoesNotExist, ValueError):
        error = Response(
            {"error": "Invalid or unrecognized X-Client-Token."},
            status=status.HTTP_404_NOT_FOUND
        )
        return None, error


class StreamChatResponseView(APIView):
    """
    API View to handle streaming chat responses.
    Expects POST request with session_id, prompt, model_slug, and X-Client-Token header.
    """
    # TODO (Day 14): Replace AllowAny with IsAuthenticated when JWT auth is active.
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        session_id = request.data.get('session_id')
        prompt = request.data.get('prompt')
        model_slug = request.data.get('model_slug')
        parent_message_id = request.data.get('parent_message_id')
        document_id = request.data.get('document_id')

        if not session_id or not prompt or not model_slug:
            return Response(
                {"error": "session_id, prompt, and model_slug are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ownership validation via X-Client-Token
        client, error = _get_anonymous_client(request)
        if error:
            return error

        # Instantiate the generator — passes client_token for session ownership check
        stream_generator = stream_chat_response_service(
            session_id=session_id,
            prompt=prompt,
            model_slug=model_slug,
            client_token=str(client.client_token),
            parent_message_id=parent_message_id,
            document_id=document_id
        )

        # Return StreamingHttpResponse configured for SSE
        response = StreamingHttpResponse(
            stream_generator,
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'  # Disables proxy buffering in Nginx
        return response


class RecommendModelView(APIView):
    """
    API View to recommend the best AI model based on the user's prompt.
    """
    # TODO (Day 14): Harden with IsAuthenticated for production.
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        prompt = request.data.get('prompt')

        if not prompt or not str(prompt).strip():
            return Response(
                {"error": "The 'prompt' field is required and cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = smart_recommendation_service(prompt)
            if not result.get('recommended_model'):
                return Response(
                    {"error": result.get('reason', 'No active models found.')},
                    status=status.HTTP_404_NOT_FOUND
                )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "An internal server error occurred while processing the recommendation."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatSessionView(APIView):
    """
    POST: Create a new ChatSession for an anonymous client.
    GET:  List all ChatSessions owned by the requesting anonymous client.
    """
    # TODO (Day 14): Replace AllowAny with IsAuthenticated when JWT auth is active.
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        model_slug = request.data.get('model_slug')
        title = request.data.get('title', 'New Chat')

        if not model_slug:
            return Response(
                {"error": "model_slug is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ai_model = AIModel.objects.get(slug=model_slug, is_active=True)
        except AIModel.DoesNotExist:
            return Response(
                {"error": f"No active model found with slug '{model_slug}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find or create AnonymousClient from header token
        token = request.headers.get('X-Client-Token')
        if token:
            try:
                anon_client = AnonymousClient.objects.get(client_token=token)
            except (AnonymousClient.DoesNotExist, ValueError):
                return Response(
                    {"error": "Invalid X-Client-Token provided."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # First time — create a new anonymous client identity
            anon_client = AnonymousClient.objects.create()

        session = ChatSession.objects.create(
            anonymous_client=anon_client,
            current_model=ai_model,
            title=title
        )

        return Response({
            "session_id": str(session.id),
            "client_token": str(anon_client.client_token),
            "title": session.title,
            "model_slug": ai_model.slug,
            "created_at": session.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        # Ownership validation required for listing
        client, error = _get_anonymous_client(request)
        if error:
            return error

        sessions = ChatSession.objects.filter(
            anonymous_client=client
        ).select_related('current_model').order_by('-updated_at')

        data = [
            {
                "session_id": str(s.id),
                "title": s.title,
                "model_slug": s.current_model.slug,
                "updated_at": s.updated_at.isoformat(),
            }
            for s in sessions
        ]
        return Response(data, status=status.HTTP_200_OK)


class ChatSessionDetailView(APIView):
    """
    GET: Return detail of a single ChatSession.
    Both session_id AND X-Client-Token must match to prevent unauthorized access.
    """
    # TODO (Day 14): Replace AllowAny with IsAuthenticated when JWT auth is active.
    permission_classes = [AllowAny]

    def get(self, request, session_id, *args, **kwargs):
        client, error = _get_anonymous_client(request)
        if error:
            return error

        try:
            session = ChatSession.objects.select_related('current_model').get(
                id=session_id,
                anonymous_client=client  # ownership enforced here
            )
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Session not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "session_id": str(session.id),
            "title": session.title,
            "model_slug": session.current_model.slug,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
        }, status=status.HTTP_200_OK)


class ConversationHistoryView(APIView):
    """
    GET: Return all messages for a given ChatSession in chronological order.
    Ownership validated via X-Client-Token — only the owning anonymous client
    can read the history.
    TODO (Day 14): Replace anonymous_client ownership with request.user.
    """
    # TODO (Day 14): Replace AllowAny with IsAuthenticated when JWT auth is active.
    permission_classes = [AllowAny]

    def get(self, request, session_id, *args, **kwargs):
        # Ownership validation
        client, error = _get_anonymous_client(request)
        if error:
            return error

        # Fetch session, enforcing ownership
        try:
            session = ChatSession.objects.get(
                id=session_id,
                anonymous_client=client
            )
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Session not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Fetch all messages in chronological order (model default: ordering = ['created_at'])
        # select_related avoids N+1 queries on model_used and parent_message
        messages = ChatMessage.objects.filter(
            session=session
        ).select_related('model_used', 'parent_message').order_by('created_at')

        data = [
            {
                "message_id": str(m.id),
                "role": m.role,
                "content": m.content,
                "model_used": m.model_used.slug if m.model_used else None,
                "parent_message_id": str(m.parent_message.id) if m.parent_message else None,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]

        return Response({
            "session_id": str(session.id),
            "title": session.title,
            "message_count": len(data),
            "messages": data,
        }, status=status.HTTP_200_OK)
