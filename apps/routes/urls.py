from django.urls import path
from . import views

urlpatterns = [
    path('',                        views.route_list,     name='route_list'),
    path('<int:route_id>/',         views.route_detail,   name='route_detail'),
    path('<int:route_id>/buses/',   views.buses_by_route, name='buses_by_route'),
]
