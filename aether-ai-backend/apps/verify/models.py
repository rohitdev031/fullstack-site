from django.db import models
from apps.chats.models import AIModel, ChatMessage
from apps.compare.models import CompareResultItem


class VerifyReview(models.Model):
    """
    VERIFY Mode Audit / Fact-Check Record.
    Stores independent verification conducted by a chosen AI model on a previous answer.
    """
    VERDICT_CHOICES = (
        ('verified', 'Verified Accurate'),
        ('conflicting', 'Conflicting Information'),
        ('needs_review', 'Needs Human Review'),
        ('inaccurate', 'Inaccurate / Hallucination'),
    )

    source_message = models.ForeignKey(
        ChatMessage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verifications'
    )
    source_compare_item = models.ForeignKey(
        CompareResultItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verifications'
    )
    verifying_model = models.ForeignKey(
        AIModel,
        on_delete=models.PROTECT,
        related_name='verifications_conducted'
    )
    verification_prompt = models.TextField()
    review_output = models.TextField()
    verdict = models.CharField(max_length=30, choices=VERDICT_CHOICES, default='verified')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'verify_reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f"VerifyReview [{self.verdict}] by {self.verifying_model.name}"
