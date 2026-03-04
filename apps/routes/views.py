from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Route, Bus
from .serializers import RouteSerializer, BusSerializer

@api_view(['GET'])
def route_list(request):
    routes = Route.objects.all()
    return Response(RouteSerializer(routes, many=True).data)

@api_view(['GET'])
def route_detail(request, route_id):
    try:
        route = Route.objects.get(id=route_id)
        return Response(RouteSerializer(route).data)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found.'}, status=404)

@api_view(['GET'])
def buses_by_route(request, route_id):
    buses = Bus.objects.filter(route_id=route_id)
    return Response(BusSerializer(buses, many=True).data)
