from django.db import models
from apps.accounts.models import Passenger
from apps.routes.models import Route

class SafetyReport(models.Model):
    TYPE_CHOICES = [
        ("safety_issue",    "Safety Issue"),
        ("unsafe_location", "Unsafe Location"),
    ]
    STATUS_CHOICES = [
        ("pending",  "Pending"),
        ("reviewed", "Reviewed"),
        ("resolved", "Resolved"),
    ]
    passenger   = models.ForeignKey(Passenger, on_delete=models.CASCADE, related_name="safety_reports")
    route       = models.ForeignKey(Route,     on_delete=models.CASCADE, related_name="safety_reports")
    report_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    location    = models.CharField(max_length=200)
    description = models.TextField()
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.report_type} by {self.passenger.full_name}"


class SafetyVote(models.Model):
    VOTE_CHOICES = [("agree", "Agree"), ("disagree", "Disagree")]
    passenger = models.ForeignKey(Passenger,    on_delete=models.CASCADE, related_name="safety_votes")
    report    = models.ForeignKey(SafetyReport, on_delete=models.CASCADE, related_name="votes")
    vote      = models.CharField(max_length=10, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("passenger", "report")

    def __str__(self):
        return f"{self.passenger.full_name} {self.vote} on report {self.report.id}"


class SafetyComment(models.Model):
    passenger  = models.ForeignKey(Passenger,    on_delete=models.CASCADE, related_name="safety_comments")
    report     = models.ForeignKey(SafetyReport, on_delete=models.CASCADE, related_name="comments")
    text       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.passenger.full_name}"
