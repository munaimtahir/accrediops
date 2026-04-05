from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from apps.api.responses import success_response
from apps.api.serializers.common import FrameworkSummarySerializer
from apps.frameworks.models import Framework
from apps.indicators.models import Indicator


class FrameworkListView(ListAPIView):
    serializer_class = FrameworkSummarySerializer

    def get_queryset(self):
        return Framework.objects.order_by("name")

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success_response(serializer.data)


class FrameworkAnalysisView(APIView):
    def get(self, request, framework_id):
        framework = get_object_or_404(Framework, pk=framework_id)
        indicators = Indicator.objects.filter(framework=framework, is_active=True)
        total = indicators.count()
        recurring = indicators.filter(is_recurring=True).count()
        one_time = indicators.filter(is_recurring=False).count()
        physical = indicators.filter(required_evidence_description__icontains="physical").count()
        registers = indicators.filter(
            text__iregex=r"(register|log)"
        ).count()
        document = indicators.filter(evidence_type="DOCUMENT").count()
        meeting_minutes = indicators.filter(
            text__iregex=r"(meeting|minutes)"
        ).count()
        return success_response(
            {
                "framework_id": framework.id,
                "framework_name": framework.name,
                "total_indicators": total,
                "recurring_indicators": recurring,
                "one_time_indicators": one_time,
                "physical_evidence_indicators": physical,
                "register_log_indicators": registers,
                "document_indicators": document,
                "meeting_minutes_indicators": meeting_minutes,
            }
        )
