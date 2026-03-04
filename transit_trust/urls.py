from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/",    include("apps.accounts.urls")),
    path("api/routes/",  include("apps.routes.urls")),
    path("api/ratings/", include("apps.ratings.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("",             TemplateView.as_view(template_name="login.html"),    name="login"),
    path("register/",    TemplateView.as_view(template_name="register.html"), name="register"),
    path("app/",         TemplateView.as_view(template_name="index.html"),    name="app"),
]