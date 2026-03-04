from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import OverchargeReport
from .serializers import OverchargeReportSerializer

@api_view(['GET'])
def report_list(request):
    passenger_id = request.query_params.get('passenger_id')
    if passenger_id:
        reports = OverchargeReport.objects.filter(passenger_id=passenger_id).order_by('-created_at')
    else:
        reports = OverchargeReport.objects.all().order_by('-created_at')
    return Response(OverchargeReportSerializer(reports, many=True).data)

@api_view(['POST'])
def submit_report(request):
    serializer = OverchargeReportSerializer(data=request.data)
    if serializer.is_valid():
        report = serializer.save()
        return Response(OverchargeReportSerializer(report).data, status=status.HTTP_201_CREATED)
    return Response({'error': list(serializer.errors.values())[0][0]}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def update_status(request, report_id):
    try:
        report = OverchargeReport.objects.get(id=report_id)
    except OverchargeReport.DoesNotExist:
        return Response({'error': 'Report not found.'}, status=404)
    new_status = request.data.get('status')
    if new_status not in ['pending', 'reviewed', 'resolved']:
        return Response({'error': 'Invalid status.'}, status=400)
    report.status = new_status
    report.save()
    return Response(OverchargeReportSerializer(report).data)
