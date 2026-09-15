from django.urls import path
from .views import CompareRunView, CompareResultView

app_name = 'compare'

urlpatterns = [
    path('run/', CompareRunView.as_view(), name='compare_run'),
    path('<uuid:compare_session_id>/', CompareResultView.as_view(), name='compare_result'),
]
