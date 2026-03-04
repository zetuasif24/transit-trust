from django.db import models
from apps.accounts.models import Passenger
from apps.routes.models import Bus, Route

class OverchargeReport(models.Model):
    STATUS_CHOICES = [('pending','Pending'),('reviewed','Reviewed'),('resolved','Resolved')]
    passenger      = models.ForeignKey(Passenger, on_delete=models.CASCADE, related_name='reports')
    bus            = models.ForeignKey(Bus,       on_delete=models.CASCADE, related_name='reports')
    route          = models.ForeignKey(Route,     on_delete=models.CASCADE, related_name='reports')
    charged_amount = models.FloatField()
    official_fare  = models.FloatField()
    status         = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.passenger.full_name} on {self.bus.license_num}"
