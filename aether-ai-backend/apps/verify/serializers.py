from rest_framework import serializers
from .models import VerifyReview

class VerifyReviewSerializer(serializers.ModelSerializer):
    verifying_model_slug = serializers.CharField(source='verifying_model.slug', read_only=True)
    verifying_model_name = serializers.CharField(source='verifying_model.name', read_only=True)
    original_answer_text = serializers.SerializerMethodField()
    original_model_name = serializers.SerializerMethodField()

    class Meta:
        model = VerifyReview
        fields = [
            'id',
            'source_message',
            'source_compare_item',
            'verifying_model_slug',
            'verifying_model_name',
            'original_answer_text',
            'original_model_name',
            'review_output',
            'verdict',
            'created_at'
        ]

    def get_original_answer_text(self, obj):
        if obj.source_message:
            return obj.source_message.content
        if obj.source_compare_item:
            return obj.source_compare_item.response_text
        return None

    def get_original_model_name(self, obj):
        if obj.source_message:
            return obj.source_message.model_used.name if obj.source_message.model_used else 'Unknown Model'
        if obj.source_compare_item:
            return obj.source_compare_item.model.name if obj.source_compare_item.model else 'Unknown Model'
        return 'Unknown Model'

class VerifyRequestSerializer(serializers.Serializer):
    verifying_model_slug = serializers.CharField(required=True)
