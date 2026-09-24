import os
from rest_framework import serializers
from .models import DocumentFile
from apps.chats.models import ChatSession

class DocumentUploadSerializer(serializers.ModelSerializer):
    session_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = DocumentFile
        fields = ['id', 'file', 'original_name', 'file_type', 'file_size', 'processing_status', 'session_id']
        read_only_fields = ['id', 'original_name', 'file_type', 'file_size', 'processing_status']

    def validate_file(self, value):
        max_size = 10 * 1024 * 1024  # 10 MB
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 10MB.")
        
        ext = os.path.splitext(value.name)[1].lower()
        allowed_extensions = ['.pdf', '.txt', '.docx', '.md', '.csv']
        if ext not in allowed_extensions:
            raise serializers.ValidationError(f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}")
        
        return value

    def validate_session_id(self, value):
        if not ChatSession.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid session_id. Chat session does not exist.")
        return value

    def create(self, validated_data):
        session_id = validated_data.pop('session_id')
        file_obj = validated_data.get('file')
        
        session = ChatSession.objects.get(id=session_id)
        
        original_name = file_obj.name
        file_size = file_obj.size
        file_type = os.path.splitext(original_name)[1].lower().strip('.')
        
        document = DocumentFile.objects.create(
            session=session,
            file=file_obj,
            original_name=original_name,
            file_type=file_type,
            file_size=file_size,
            processing_status='uploaded'
        )
        return document
