from rest_framework import serializers
from .models import Passenger

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ['id', 'full_name', 'phone', 'password', 'gender', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_phone(self, value):
        import re
        clean = value.strip().replace(' ', '')
        if not re.match(r'^01\d{9}$', clean):
            raise serializers.ValidationError('Phone must be 11 digits starting with 01.')
        return clean

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError('Password must be at least 6 characters.')
        return value

    def create(self, validated_data):
        return Passenger.objects.create(**validated_data)

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ['id', 'full_name', 'phone', 'gender', 'role', 'created_at']
