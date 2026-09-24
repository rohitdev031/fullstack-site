import time
from django.test import TestCase
from apps.compare.services import run_compare_service
from apps.compare.models import CompareSession, CompareResultItem
from apps.chats.models import AIModel
from unittest.mock import patch

class CompareServiceTests(TestCase):
    def setUp(self):
        # Create some active models for testing
        self.model1 = AIModel.objects.create(name="Model 1", slug="model-1", provider="Mock", is_active=True)
        self.model2 = AIModel.objects.create(name="Model 2", slug="model-2", provider="Mock", is_active=True)
        self.model3 = AIModel.objects.create(name="Model 3", slug="model-3", provider="Mock", is_active=True)

    def test_deduplication(self):
        # Test that duplicate models in input are deduplicated
        slugs = ["model-1", "model-1", "model-2"]
        result = run_compare_service("Test prompt", slugs)
        
        self.assertEqual(len(result['results']), 2)
        self.assertEqual(result['results'][0]['model_slug'], "model-1")
        self.assertEqual(result['results'][1]['model_slug'], "model-2")
        self.assertEqual(CompareResultItem.objects.count(), 2)

    def test_invalid_model(self):
        with self.assertRaises(ValueError):
            run_compare_service("Test prompt", ["model-1", "invalid-model"])

    @patch('core.ai_providers.mock_provider.MockAIProvider.generate_response')
    def test_parallel_performance(self, mock_generate):
        # Make the mock provider take 1 second per call
        def slow_generate(*args, **kwargs):
            time.sleep(1)
            return {'content': 'Response', 'latency_ms': 1000, 'token_count': 10}
        
        mock_generate.side_effect = slow_generate
        
        start_time = time.time()
        result = run_compare_service("Test prompt", ["model-1", "model-2", "model-3"])
        end_time = time.time()
        
        # 3 models taking 1 sec each should finish in ~1 second if parallel, not 3 seconds.
        self.assertLess(end_time - start_time, 2.0)
        self.assertEqual(len(result['results']), 3)

    @patch('apps.compare.services.COMPARE_TIMEOUT_SECONDS', 2)
    @patch('core.ai_providers.mock_provider.MockAIProvider.generate_response')
    def test_timeout_handling(self, mock_generate):
        """
        Simulates a scenario where model-2 hangs past the timeout.
        The timeout constant is patched to 2s (instead of 20s) so the test finishes fast.
        Verifies:
          - Fast models (model-1, model-3) still return 'completed'.
          - The timed-out model (model-2) returns 'failed' with timeout message.
          - The service does NOT hang indefinitely.
          - All 3 results (2 completed + 1 failed) are persisted in DB.
          - MockAIProvider is restored automatically after the test.
        """
        fast_response = {'content': 'Fast response', 'latency_ms': 200, 'token_count': 5}

        def selective_generate(*args, **kwargs):
            api_model_id = kwargs.get('api_model_id', '')
            if api_model_id == 'model-2':
                # Sleep 3s — longer than our patched 2s timeout
                time.sleep(3)
            return fast_response

        mock_generate.side_effect = selective_generate

        start = time.time()
        result = run_compare_service("Test timeout", ["model-1", "model-2", "model-3"])
        elapsed = time.time() - start

        # Service should finish in ~2s (timeout fires), NOT 3s+ or hang indefinitely
        self.assertLess(elapsed, 3.5, f"Service hung too long: {elapsed:.2f}s")

        # All 3 results must be returned
        self.assertEqual(len(result['results']), 3)

        statuses = {r['model_slug']: r['status'] for r in result['results']}
        self.assertEqual(statuses['model-1'], 'completed')
        self.assertEqual(statuses['model-3'], 'completed')
        self.assertEqual(statuses['model-2'], 'failed')

        # Verify timeout message in failed result
        model2_result = next(r for r in result['results'] if r['model_slug'] == 'model-2')
        self.assertIn('time', model2_result['response'].lower())

        # All 3 records persisted in DB
        session_id = result['compare_session_id']
        self.assertEqual(CompareResultItem.objects.filter(compare_session_id=session_id).count(), 3)
        failed_items = CompareResultItem.objects.filter(compare_session_id=session_id, status='failed')
        self.assertEqual(failed_items.count(), 1)

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.compare.models import CompareSession, CompareResultItem
from apps.chats.models import ChatSession, ChatMessage
import uuid

class CompareViewTests(APITestCase):
    def setUp(self):
        # Create models
        self.model1 = AIModel.objects.create(name="GPT-4", slug="gpt-4", provider="Mock", is_active=True)
        self.model2 = AIModel.objects.create(name="Claude", slug="claude-3", provider="Mock", is_active=True)
        
        # Create chat session and messages for from-message endpoint
        self.chat_session = ChatSession.objects.create(current_model=self.model1)
        self.user_message = ChatMessage.objects.create(
            session=self.chat_session,
            role="user",
            content="What is AI?",
            model_used=self.model1
        )
        self.assistant_message = ChatMessage.objects.create(
            session=self.chat_session,
            role="assistant",
            content="AI is...",
            model_used=self.model1,
            parent_message=self.user_message
        )

    def test_run_compare_success(self):
        url = reverse('compare_run') if hasattr(self, 'reverse') else '/api/compare/run/'
        data = {
            "prompt": "Test comparison",
            "model_slugs": ["gpt-4", "claude-3"]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("compare_session_id", response.data)
        self.assertEqual(len(response.data["results"]), 2)
        
        # Verify DB
        session_id = response.data["compare_session_id"]
        self.assertEqual(CompareSession.objects.filter(id=session_id).count(), 1)
        self.assertEqual(CompareResultItem.objects.filter(compare_session_id=session_id).count(), 2)

    def test_run_compare_duplicate_slugs(self):
        url = '/api/compare/run/'
        data = {
            "prompt": "Test deduplication",
            "model_slugs": ["gpt-4", "gpt-4"]
        }
        # Deduplication happens in service, but View checks if there are at least 2 models provided
        # The view validates len(model_slugs) < 2 based on input array length, which is 2.
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["results"]), 1)

    def test_from_message_user_role(self):
        url = f'/api/compare/from-message/{self.user_message.id}/'
        data = {"model_slugs": ["gpt-4", "claude-3"]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['prompt'], "What is AI?")

    def test_from_message_assistant_role(self):
        url = f'/api/compare/from-message/{self.assistant_message.id}/'
        data = {"model_slugs": ["gpt-4", "claude-3"]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['prompt'], "What is AI?")

    def test_from_message_invalid_id(self):
        url = f'/api/compare/from-message/{uuid.uuid4()}/'
        data = {"model_slugs": ["gpt-4", "claude-3"]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_compare_result_view(self):
        # Create session and results first
        session = CompareSession.objects.create(prompt="Test Fetch")
        CompareResultItem.objects.create(compare_session=session, model=self.model1, response_text="Res 1", status="completed")
        CompareResultItem.objects.create(compare_session=session, model=self.model2, response_text="Res 2", status="completed")
        
        url = f'/api/compare/{session.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
