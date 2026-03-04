from django.urls import path
from . import views

urlpatterns = [
    path('register/',           views.register,        name='register'),
    path('login/',              views.login,           name='login'),
    path('profile/<int:user_id>/', views.update_profile, name='update_profile'),
    path('stats/',              views.stats,           name='stats'),
]
