from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chats/', include('apps.chats.urls')),
    path('api/compare/', include('apps.compare.urls')),
]
