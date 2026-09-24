from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.chats.models import AIModel, ChatSession, ChatMessage
from apps.compare.models import CompareSession, CompareResultItem
from apps.verify.models import VerifyReview
from unittest.mock import patch
import uuid

class VerifyServiceTests(APITestCase):
    def setUp(self):
        # Create models
        self.verify_model = AIModel.objects.create(name="GPT-4o", slug="gpt-4o", provider="Mock", is_active=True)
        self.other_model = AIModel.objects.create(name="Claude", slug="claude-3", provider="Mock", is_active=True)
        
        # Create chat session and messages for from-message endpoint
        self.chat_session = ChatSession.objects.create(current_model=self.other_model)
        self.user_message = ChatMessage.objects.create(
            session=self.chat_session,
            role="user",
            content="Who wrote Hamlet?",
            model_used=self.other_model
        )
        self.assistant_message = ChatMessage.objects.create(
            session=self.chat_session,
            role="assistant",
            content="Hamlet was written by Charles Dickens.",
            model_used=self.other_model,
            parent_message=self.user_message
        )
        
        # Create compare session and results for from-compare endpoint
        self.compare_session = CompareSession.objects.create(prompt="What is the speed of light?")
        self.compare_item = CompareResultItem.objects.create(
            compare_session=self.compare_session,
            model=self.other_model,
            response_text="The speed of light is 300,000 km/s.",
            status="completed"
        )

    @patch('core.ai_providers.mock_provider.MockAIProvider.generate_response')
    def test_verify_from_message_success(self, mock_generate):
        mock_generate.return_value = {
            'content': 'VERDICT: inaccurate\n\nCharles Dickens did not write Hamlet. William Shakespeare did.',
            'model_slug': 'gpt-4o'
        }
        
        url = reverse('verify_from_message', kwargs={'message_id': self.assistant_message.id})
        data = {"verifying_model_slug": "gpt-4o"}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['verdict'], 'inaccurate')
        self.assertEqual(response.data['verifying_model_slug'], 'gpt-4o')
        self.assertIn('Charles Dickens did not write Hamlet', response.data['review_output'])
        
        # Check DB
        review = VerifyReview.objects.get(id=response.data['id'])
        self.assertEqual(review.source_message, self.assistant_message)
        self.assertIsNone(review.source_compare_item)
        self.assertEqual(review.verdict, 'inaccurate')

    @patch('core.ai_providers.mock_provider.MockAIProvider.generate_response')
    def test_verify_from_compare_success(self, mock_generate):
        mock_generate.return_value = {
            'content': 'VERDICT: verified\n\nYes, the speed of light is approximately 300,000 km/s.',
            'model_slug': 'gpt-4o'
        }
        
        url = reverse('verify_from_compare', kwargs={'compare_item_id': self.compare_item.id})
        data = {"verifying_model_slug": "gpt-4o"}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['verdict'], 'verified')
        
        # Check DB
        review = VerifyReview.objects.get(id=response.data['id'])
        self.assertEqual(review.source_compare_item, self.compare_item)
        self.assertIsNone(review.source_message)

    @patch('core.ai_providers.mock_provider.MockAIProvider.generate_response')
    def test_verify_fallback_to_needs_review(self, mock_generate):
        # AI returns output without the expected VERDICT format
        mock_generate.return_value = {
            'content': 'I am not sure if Charles Dickens wrote Hamlet. Let me think.',
            'model_slug': 'gpt-4o'
        }
        
        url = reverse('verify_from_message', kwargs={'message_id': self.assistant_message.id})
        data = {"verifying_model_slug": "gpt-4o"}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Should fallback to 'needs_review'
        self.assertEqual(response.data['verdict'], 'needs_review')
        self.assertEqual(response.data['review_output'], 'I am not sure if Charles Dickens wrote Hamlet. Let me think.')

    def test_verify_missing_model(self):
        url = reverse('verify_from_message', kwargs={'message_id': self.assistant_message.id})
        data = {"verifying_model_slug": "invalid-model"}
        response = self.client.post(url, data, format='json')
        
        # Should return 400 Bad Request because model does not exist or validation fails
        # Currently, verifying_model_slug validation is manually done in view, or it throws 404/ValueError
        # Since get_object_or_404 is used for verifying_model in the service, it might raise 404. Let's see how View handles it.
        # Ah, view just catches ValueError. If get_object_or_404 fails, it raises Http404, which returns 404 in DRF.
        # Let's assert 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_verify_non_assistant_message(self):
        # Target the user message instead of the assistant message
        url = reverse('verify_from_message', kwargs={'message_id': self.user_message.id})
        data = {"verifying_model_slug": "gpt-4o"}
        response = self.client.post(url, data, format='json')
        
        # Should return 400 with our custom ValueError message
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("must be an assistant response", response.data['error'])

    def test_verify_invalid_source_id(self):
        url = reverse('verify_from_message', kwargs={'message_id': uuid.uuid4()})
        data = {"verifying_model_slug": "gpt-4o"}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
