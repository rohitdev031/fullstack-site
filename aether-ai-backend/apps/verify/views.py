from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VerifyRequestSerializer, VerifyReviewSerializer
from .services import run_verification_service

class VerifyFromMessageView(APIView):
    def post(self, request, message_id):
        serializer = VerifyRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        verifying_model_slug = serializer.validated_data['verifying_model_slug']

        try:
            review = run_verification_service(
                source_type='message',
                source_id=message_id,
                verifying_model_slug=verifying_model_slug
            )
            response_data = VerifyReviewSerializer(review).data
            return Response(response_data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class VerifyFromCompareView(APIView):
    def post(self, request, compare_item_id):
        serializer = VerifyRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        verifying_model_slug = serializer.validated_data['verifying_model_slug']

        try:
            review = run_verification_service(
                source_type='compare',
                source_id=compare_item_id,
                verifying_model_slug=verifying_model_slug
            )
            response_data = VerifyReviewSerializer(review).data
            return Response(response_data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
