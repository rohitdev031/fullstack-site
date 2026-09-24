from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from .serializers import DocumentUploadSerializer
from apps.chats.views import _get_anonymous_client
from apps.chats.models import ChatSession

class DocumentUploadView(APIView):
    """
    POST: Upload a document and link it to a ChatSession.
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny] # TODO (Day 14): Replace with IsAuthenticated

    def post(self, request, *args, **kwargs):
        # Enforce Ownership
        client, error = _get_anonymous_client(request)
        if error:
            return error
            
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({"error": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the session actually belongs to this client
        try:
            ChatSession.objects.get(id=session_id, anonymous_client=client)
        except ChatSession.DoesNotExist:
            return Response({"error": "Session not found or access denied."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DocumentUploadSerializer(data=request.data)
        if serializer.is_valid():
            document = serializer.save()

            # Attempt text extraction
            try:
                document.processing_status = 'processing'
                document.save(update_fields=['processing_status'])

                from .utils import extract_text_from_file
                extracted_text = extract_text_from_file(document.file.path)
                
                document.extracted_text = extracted_text
                document.processing_status = 'completed'
                document.save(update_fields=['extracted_text', 'processing_status'])
            except Exception as e:
                print(f"Extraction failed for {document.id}: {e}")
                document.processing_status = 'failed'
                document.save(update_fields=['processing_status'])

            return Response({
                "document_id": str(document.id),
                "original_name": document.original_name,
                "file_size": document.file_size,
                "file_type": document.file_type,
                "processing_status": document.processing_status
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
