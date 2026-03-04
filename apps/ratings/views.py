from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import ServiceRating
from .serializers import ServiceRatingSerializer

@api_view(['GET'])
def rating_list(request):
    passenger_id = request.query_params.get('passenger_id')
    if passenger_id:
        ratings = ServiceRating.objects.filter(passenger_id=passenger_id).order_by('-created_at')
    else:
        ratings = ServiceRating.objects.all().order_by('-created_at')
    return Response(ServiceRatingSerializer(ratings, many=True).data)

@api_view(['POST'])
def submit_rating(request):
    serializer = ServiceRatingSerializer(data=request.data)
    if serializer.is_valid():
        rating = serializer.save()
        return Response(ServiceRatingSerializer(rating).data, status=status.HTTP_201_CREATED)
    return Response({'error': list(serializer.errors.values())[0][0]}, status=status.HTTP_400_BAD_REQUEST)
