from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/",    include("apps.accounts.urls")),
    path("api/routes/",  include("apps.routes.urls")),
    path("api/ratings/", include("apps.ratings.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/safety/",  include("apps.safety.urls")),
    path('api/', include('apps.accounts.chat_urls')),
]
