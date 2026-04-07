from django.urls import path
from . import views

urlpatterns = [
    path("",                         views.safety_report_list,   name="safety_list"),
    path("submit/",                  views.submit_safety_report, name="submit_safety"),
    path("<int:report_id>/status/",  views.update_safety_status, name="update_safety_status"),
    path("<int:report_id>/vote/",    views.vote,                 name="safety_vote"),
    path("<int:report_id>/comment/", views.add_comment,          name="safety_comment"),
    path("<int:report_id>/myvote/",  views.get_votes,            name="my_vote"),
]
