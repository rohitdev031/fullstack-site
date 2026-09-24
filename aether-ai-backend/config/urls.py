from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chats/', include('apps.chats.urls')),
    path('api/compare/', include('apps.compare.urls')),
    path('api/verify/', include('apps.verify.urls')),
    path('api/documents/', include('apps.documents.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
