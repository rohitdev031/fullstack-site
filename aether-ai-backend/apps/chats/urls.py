from django.urls import path
from .views import StreamChatResponseView, RecommendModelView, ChatSessionView, ChatSessionDetailView, ConversationHistoryView

app_name = 'chats'

urlpatterns = [
    path('stream/', StreamChatResponseView.as_view(), name='stream_chat'),
    path('recommend/', RecommendModelView.as_view(), name='recommend_model'),
    path('sessions/', ChatSessionView.as_view(), name='chat_sessions'),
    path('sessions/<uuid:session_id>/', ChatSessionDetailView.as_view(), name='chat_session_detail'),
    path('sessions/<uuid:session_id>/history/', ConversationHistoryView.as_view(), name='conversation_history'),
]
