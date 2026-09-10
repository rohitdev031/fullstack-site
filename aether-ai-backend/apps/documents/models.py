import uuid
from django.db import models
from apps.chats.models import ChatSession


class DocumentFile(models.Model):
    """
    User Uploaded Document File & Extracted Text Metadata.
    """
    STATUS_CHOICES = (
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents'
    )
    file = models.FileField(upload_to='documents/')
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)  # e.g., 'pdf', 'txt', 'docx'
    file_size = models.BigIntegerField()  # size in bytes
    processing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    extracted_text = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_files'
        ordering = ['-created_at']

    def __str__(self):
        return f"Document ({self.original_name}) - {self.processing_status}"
