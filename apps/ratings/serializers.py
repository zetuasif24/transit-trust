from rest_framework import serializers
from .models import ServiceRating
from apps.routes.serializers import BusSerializer

class ServiceRatingSerializer(serializers.ModelSerializer):
    bus_detail       = BusSerializer(source='bus', read_only=True)
    passenger_name   = serializers.CharField(source='passenger.full_name', read_only=True)

    class Meta:
        model  = ServiceRating
        fields = ['id', 'passenger', 'bus', 'rating_score', 'comment', 'created_at',
                  'bus_detail', 'passenger_name']
