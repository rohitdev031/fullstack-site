import uuid
from django.db import models
from django.conf import settings


class AIModel(models.Model):
    """
    Registry for available AI models (Gemini 1.5 Pro, GPT-4o, Claude 3.5 Sonnet).
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    provider = models.CharField(max_length=50)  # e.g., 'google', 'openai', 'anthropic'
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_models'
        verbose_name = 'AI Model'
        verbose_name_plural = 'AI Models'

    def __str__(self):
        return f"{self.name} ({self.provider})"


class AnonymousClient(models.Model):
    """
    Temporary anonymous client identity for session ownership.
    One client_token per browser/client — can own multiple ChatSessions.
    TODO (Day 14): Replace with JWT user authentication.
    When JWT is ready, filter will switch from anonymous_client__client_token to user=request.user.
    """
    client_token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'anonymous_clients'

    def __str__(self):
        return f"AnonymousClient({self.client_token})"


class ChatSession(models.Model):
    """
    ASK Mode Conversation Session.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='chat_sessions'
    )
    # TODO (Day 14): Remove anonymous_client once JWT auth is active.
    anonymous_client = models.ForeignKey(
        AnonymousClient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_sessions'
    )
    title = models.CharField(max_length=255, default='New Chat')
    current_model = models.ForeignKey(
        AIModel,
        on_delete=models.PROTECT,
        related_name='chat_sessions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_sessions'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['anonymous_client', '-updated_at']),
        ]

    def __str__(self):
        return f"Chat ({self.title}) - {self.id}"


class ChatMessage(models.Model):
    """
    Individual User Prompts and AI Assistant Responses in ASK Mode.
    Supports parent_message relationship for conversation threading.
    """
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    model_used = models.ForeignKey(
        AIModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages'
    )
    parent_message = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replies'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
        ]

    def __str__(self):
        return f"[{self.role}] {self.content[:30]}..."
