from rest_framework import serializers
from .models import SafetyReport, SafetyVote, SafetyComment
from apps.routes.serializers import RouteSerializer


class SafetyCommentSerializer(serializers.ModelSerializer):
    passenger_name = serializers.CharField(source="passenger.full_name", read_only=True)

    class Meta:
        model  = SafetyComment
        fields = ["id", "passenger", "report", "text", "created_at", "passenger_name"]


class SafetyReportSerializer(serializers.ModelSerializer):
    route_detail   = RouteSerializer(source="route", read_only=True)
    passenger_name = serializers.CharField(source="passenger.full_name", read_only=True)
    agree_count    = serializers.SerializerMethodField()
    disagree_count = serializers.SerializerMethodField()
    comments       = SafetyCommentSerializer(many=True, read_only=True)

    def get_agree_count(self, obj):
        return obj.votes.filter(vote="agree").count()

    def get_disagree_count(self, obj):
        return obj.votes.filter(vote="disagree").count()

    class Meta:
        model  = SafetyReport
        fields = ["id", "passenger", "route", "report_type", "location", "description",
                  "status", "created_at", "route_detail", "passenger_name",
                  "agree_count", "disagree_count", "comments"]


class SafetyVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SafetyVote
        fields = ["id", "passenger", "report", "vote"]
