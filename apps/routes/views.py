from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Route, Bus
from .serializers import RouteSerializer, BusSerializer


@api_view(['GET'])
def route_list(request):
    return Response(RouteSerializer(Route.objects.all(), many=True).data)


@api_view(['GET'])
def route_detail(request, route_id):
    try:
        return Response(RouteSerializer(Route.objects.get(id=route_id)).data)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found.'}, status=404)


@api_view(['GET'])
def buses_by_route(request, route_id):
    return Response(BusSerializer(Bus.objects.filter(route_id=route_id), many=True).data)


@api_view(['GET'])
def locations(request):
    """Return all unique start and end points for From/To dropdowns."""
    routes = Route.objects.all()
    points = set()
    for r in routes:
        points.add(r.start_point)
        points.add(r.end_point)
    return Response(sorted(list(points)))


@api_view(['GET'])
def find_route(request):
    """
    Find a route by from/to. If no exact match, return estimated fare.
    Rate: 2.42 Tk per km (official BRTA rate).
    """
    from_point = request.query_params.get('from', '').strip()
    to_point   = request.query_params.get('to', '').strip()

    if not from_point or not to_point:
        return Response({'error': 'Please provide both from and to locations.'}, status=400)

    if from_point == to_point:
        return Response({'error': 'From and To locations cannot be the same.'}, status=400)

    # Try exact match both ways
    route = Route.objects.filter(
        start_point=from_point, end_point=to_point
    ).first() or Route.objects.filter(
        start_point=to_point, end_point=from_point
    ).first()

    if route:
        return Response({
            'found':         True,
            'route_id':      route.id,
            'name':          route.name,
            'start_point':   route.start_point,
            'end_point':     route.end_point,
            'distance':      route.distance,
            'official_fare': route.official_fare,
            'fare_type':     'official',
        })

    # No exact match — estimate using BRTA rate with default 15km distance
    BRTA_RATE = 2.42
    estimated_distance = 15
    estimated_fare = round(estimated_distance * BRTA_RATE)

    return Response({
        'found':         False,
        'name':          f'{from_point} to {to_point}',
        'start_point':   from_point,
        'end_point':     to_point,
        'distance':      estimated_distance,
        'official_fare': estimated_fare,
        'fare_type':     'estimated',
        'rate':          BRTA_RATE,
    })
