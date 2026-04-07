from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import SafetyReport, SafetyVote, SafetyComment
from .serializers import SafetyReportSerializer, SafetyCommentSerializer


@api_view(["GET"])
def safety_report_list(request):
    pid      = request.query_params.get("passenger_id")
    rtype    = request.query_params.get("type")
    rstatus  = request.query_params.get("status")
    route_id = request.query_params.get("route_id")
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
    if new_status not in ["pending", "reviewed", "resolved"]:
        return Response({"error": "Invalid status."}, status=400)
    report.status = new_status
    report.save()
    return Response(SafetyReportSerializer(report).data)


@api_view(["POST"])
def vote(request, report_id):
    passenger_id = request.data.get("passenger")
    vote_value   = request.data.get("vote")
    if vote_value not in ["agree", "disagree"]:
        return Response({"error": "Invalid vote."}, status=400)
    try:
        report = SafetyReport.objects.get(id=report_id)
    except SafetyReport.DoesNotExist:
        return Response({"error": "Report not found."}, status=404)

    existing = SafetyVote.objects.filter(passenger_id=passenger_id, report=report).first()
    if existing:
        # Allow changing vote
        existing.vote = vote_value
        existing.save()
    else:
        SafetyVote.objects.create(passenger_id=passenger_id, report=report, vote=vote_value)

    updated = SafetyReportSerializer(report).data
    return Response({"agree_count": updated["agree_count"], "disagree_count": updated["disagree_count"], "vote": vote_value})


@api_view(["POST"])
def add_comment(request, report_id):
    passenger_id = request.data.get("passenger")
    text         = request.data.get("text", "").strip()
    if not text:
        return Response({"error": "Comment cannot be empty."}, status=400)
    try:
        report = SafetyReport.objects.get(id=report_id)
    except SafetyReport.DoesNotExist:
        return Response({"error": "Report not found."}, status=404)
    comment = SafetyComment.objects.create(passenger_id=passenger_id, report=report, text=text)
    return Response(SafetyCommentSerializer(comment).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def get_votes(request, report_id):
    passenger_id = request.query_params.get("passenger_id")
    if not passenger_id:
        return Response({"voted": False, "vote": None})
    voted = SafetyVote.objects.filter(passenger_id=passenger_id, report_id=report_id).first()
    if voted:
        return Response({"voted": True, "vote": voted.vote})
    return Response({"voted": False, "vote": None})
