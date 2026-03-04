from django.urls import path
from . import views

urlpatterns = [
    path('',        views.rating_list,   name='rating_list'),
    path('submit/', views.submit_rating, name='submit_rating'),
]
