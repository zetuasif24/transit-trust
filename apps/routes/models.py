from django.db import models

class Route(models.Model):
    name          = models.CharField(max_length=100)
    start_point   = models.CharField(max_length=100)
    end_point     = models.CharField(max_length=100)
    distance      = models.FloatField()
    official_fare = models.FloatField()

    def __str__(self):
        return self.name

class Bus(models.Model):
    route       = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='buses')
    name        = models.CharField(max_length=100)
    license_num = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name} ({self.license_num})"
