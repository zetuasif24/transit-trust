from django.urls import path
from . import views
urlpatterns = [
    path("",                        views.safety_report_list,    name="safety_report_list"),
    path("submit/",                 views.submit_safety_report,  name="submit_safety_report"),
    path("<int:report_id>/status/", views.update_safety_status,  name="update_safety_status"),
]
