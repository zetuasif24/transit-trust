from django.db import models
from apps.accounts.models import Passenger
from apps.routes.models import Bus

class ServiceRating(models.Model):
    passenger    = models.ForeignKey(Passenger, on_delete=models.CASCADE, related_name='ratings')
    bus          = models.ForeignKey(Bus,       on_delete=models.CASCADE, related_name='ratings')
    rating_score = models.IntegerField()
    comment      = models.TextField(blank=True, default='')
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating {self.rating_score} by {self.passenger.full_name}"
