from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import OverchargeReport
from .serializers import OverchargeReportSerializer

@api_view(["GET"])
def report_list(request):
    pid      = request.query_params.get("passenger_id")
    rstatus  = request.query_params.get("status")
    route_id = request.query_params.get("route_id")
    qs = OverchargeReport.objects.all().order_by("-created_at")
    if pid:      qs = qs.filter(passenger_id=pid)
    if rstatus:  qs = qs.filter(status=rstatus)
    if route_id: qs = qs.filter(route_id=route_id)
    return Response(OverchargeReportSerializer(qs, many=True).data)

@api_view(["POST"])
def submit_report(request):
    serializer = OverchargeReportSerializer(data=request.data)
    if serializer.is_valid():
        return Response(OverchargeReportSerializer(serializer.save()).data, status=status.HTTP_201_CREATED)
    return Response({"error": list(serializer.errors.values())[0][0]}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PATCH"])
def update_status(request, report_id):
    try:
        report = OverchargeReport.objects.get(id=report_id)
    except OverchargeReport.DoesNotExist:
        return Response({"error": "Report not found."}, status=404)
    new_status = request.data.get("status")
    if new_status not in ["pending","reviewed","resolved"]:
        return Response({"error": "Invalid status."}, status=400)
    report.status = new_status
    report.save()
    return Response(OverchargeReportSerializer(report).data)
