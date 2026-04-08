from django.urls import path
from . import chat_views

urlpatterns = [
    path('chat/', chat_views.chat, name='chat'),
]