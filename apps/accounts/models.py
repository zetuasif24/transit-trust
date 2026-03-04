from django.db import models

class Passenger(models.Model):
    GENDER_CHOICES = [('male','Male'),('female','Female'),('other','Other')]
    ROLE_CHOICES   = [('passenger','Passenger'),('admin','Admin')]
    full_name  = models.CharField(max_length=100)
    phone      = models.CharField(max_length=15, unique=True)
    password   = models.CharField(max_length=128)
    gender     = models.CharField(max_length=10, choices=GENDER_CHOICES)
    role       = models.CharField(max_length=10, choices=ROLE_CHOICES, default='passenger')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.phone})"
