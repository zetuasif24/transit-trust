from rest_framework import serializers
from .models import OverchargeReport
from apps.routes.serializers import BusSerializer, RouteSerializer

class OverchargeReportSerializer(serializers.ModelSerializer):
    bus_detail       = BusSerializer(source='bus',   read_only=True)
    route_detail     = RouteSerializer(source='route', read_only=True)
    passenger_name   = serializers.CharField(source='passenger.full_name', read_only=True)
    excess_amount    = serializers.SerializerMethodField()

    def get_excess_amount(self, obj):
        return round(obj.charged_amount - obj.official_fare, 2)

    class Meta:
        model  = OverchargeReport
        fields = ['id', 'passenger', 'bus', 'route', 'charged_amount', 'official_fare',
                  'excess_amount', 'status', 'created_at',
                  'bus_detail', 'route_detail', 'passenger_name']
