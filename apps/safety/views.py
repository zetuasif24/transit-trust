from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import SafetyReport
from .serializers import SafetyReportSerializer

@api_view(["GET"])
def safety_report_list(request):
    pid        = request.query_params.get("passenger_id")
    rtype      = request.query_params.get("type")
    rstatus    = request.query_params.get("status")
    route_id   = request.query_params.get("route_id")
    qs = SafetyReport.objects.all().order_by("-created_at")
    if pid:      qs = qs.filter(passenger_id=pid)
    if rtype:    qs = qs.filter(report_type=rtype)
    if rstatus:  qs = qs.filter(status=rstatus)
    if route_id: qs = qs.filter(route_id=route_id)
    return Response(SafetyReportSerializer(qs, many=True).data)

@api_view(["POST"])
def submit_safety_report(request):
    serializer = SafetyReportSerializer(data=request.data)
    if serializer.is_valid():
        return Response(SafetyReportSerializer(serializer.save()).data, status=status.HTTP_201_CREATED)
    return Response({"error": list(serializer.errors.values())[0][0]}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PATCH"])
def update_safety_status(request, report_id):
    try:
        report = SafetyReport.objects.get(id=report_id)
    except SafetyReport.DoesNotExist:
        return Response({"error": "Report not found."}, status=404)
    new_status = request.data.get("status")
    if new_status not in ["pending","reviewed","resolved"]:
        return Response({"error": "Invalid status."}, status=400)
    report.status = new_status
    report.save()
    return Response(SafetyReportSerializer(report).data)
