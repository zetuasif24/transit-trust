from django.urls import path
from . import views

urlpatterns = [
    path('',                      views.report_list,   name='report_list'),
    path('submit/',               views.submit_report, name='submit_report'),
    path('<int:report_id>/status/', views.update_status, name='update_status'),
]
