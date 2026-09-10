import uuid
from django.db import models
from django.conf import settings
from apps.chats.models import AIModel


class CompareSession(models.Model):
    """
    COMPARE Mode Multi-Model Execution Session.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='compare_sessions'
    )
    prompt = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'compare_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f"CompareSession ({self.prompt[:30]}...) - {self.id}"


class CompareResultItem(models.Model):
    """
    Individual Model Result Card in a COMPARE Session.
    Stores response text, latency, token metrics, and user rating.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    compare_session = models.ForeignKey(
        CompareSession,
        on_delete=models.CASCADE,
        related_name='results'
    )
    model = models.ForeignKey(
        AIModel,
        on_delete=models.PROTECT,
        related_name='compare_results'
    )
    response_text = models.TextField()
    latency_ms = models.IntegerField(null=True, blank=True)
    token_count = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    user_rating = models.IntegerField(null=True, blank=True)  # 1-5 rating or feedback score
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'compare_result_items'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['compare_session']),
        ]

    def __str__(self):
        return f"CompareResult [{self.model.name}] for Session {self.compare_session.id}"
