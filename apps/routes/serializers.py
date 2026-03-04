from rest_framework import serializers
from .models import Route, Bus

class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Bus
        fields = ['id', 'name', 'license_num', 'route']

class RouteSerializer(serializers.ModelSerializer):
    buses = BusSerializer(many=True, read_only=True)
    class Meta:
        model  = Route
        fields = ['id', 'name', 'start_point', 'end_point', 'distance', 'official_fare', 'buses']
