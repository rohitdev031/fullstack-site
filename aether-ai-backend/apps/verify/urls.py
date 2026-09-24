from django.urls import path
from .views import VerifyFromMessageView, VerifyFromCompareView

urlpatterns = [
    path('from-message/<uuid:message_id>/', VerifyFromMessageView.as_view(), name='verify_from_message'),
    path('from-compare/<int:compare_item_id>/', VerifyFromCompareView.as_view(), name='verify_from_compare'),
]
