from rest_framework import serializers
from .models import SafetyReport
from apps.routes.serializers import RouteSerializer

class SafetyReportSerializer(serializers.ModelSerializer):
    route_detail   = RouteSerializer(source="route", read_only=True)
    passenger_name = serializers.CharField(source="passenger.full_name", read_only=True)

    class Meta:
        model  = SafetyReport
        fields = ["id","passenger","route","report_type","location",
                  "description","status","created_at","route_detail","passenger_name"]
