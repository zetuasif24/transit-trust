from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from .models import Passenger
from .serializers import RegisterSerializer, PassengerSerializer


@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        # Hash the password before saving
        validated = serializer.validated_data
        validated['password'] = make_password(validated['password'])
        user = Passenger.objects.create(**validated)
        return Response({
            'message': 'Account created successfully.',
            'user': PassengerSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(
        {'error': list(serializer.errors.values())[0][0]},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
def login(request):
    phone    = request.data.get('phone', '').strip()
    password = request.data.get('password', '')

    if not phone or not password:
        return Response(
            {'error': 'Phone and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = Passenger.objects.get(phone=phone)
    except Passenger.DoesNotExist:
        return Response(
            {'error': 'Invalid phone number or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # check_password compares plain text against the hashed value
    if not check_password(password, user.password):
        return Response(
            {'error': 'Invalid phone number or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response({
        'message': 'Login successful.',
        'user': PassengerSerializer(user).data
    })


@api_view(['PUT'])
def update_profile(request, user_id):
    try:
        user = Passenger.objects.get(id=user_id)
    except Passenger.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    full_name = request.data.get('full_name', '').strip()
    if not full_name:
        return Response({'error': 'Full name cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

    user.full_name = full_name
    user.save()
    return Response({'message': 'Profile updated.', 'user': PassengerSerializer(user).data})


@api_view(['GET'])
def stats(request):
    from apps.ratings.models import ServiceRating
    from apps.reports.models import OverchargeReport
    from django.db.models import Avg

    total_users   = Passenger.objects.count()
    total_ratings = ServiceRating.objects.count()
    total_reports = OverchargeReport.objects.count()
    avg           = ServiceRating.objects.aggregate(Avg('rating_score'))['rating_score__avg']
    avg_rating    = round(avg, 1) if avg else 'N/A'

    return Response({
        'total_users':   total_users,
        'total_ratings': total_ratings,
        'total_reports': total_reports,
        'avg_rating':    avg_rating,
    })
