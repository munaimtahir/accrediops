from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import serializers

from apps.api.responses import success_response
from apps.indicators.models import EvidenceRequirement
from apps.workflow.permissions import ExplicitAuthenticatedPermission, ensure_admin_or_lead_access

class EvidenceRequirementWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvidenceRequirement
        fields = "__all__"

class EvidenceRequirementListCreateView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def get(self, request, indicator_id):
        requirements = EvidenceRequirement.objects.filter(framework_indicator_id=indicator_id)
        serializer = EvidenceRequirementWriteSerializer(requirements, many=True)
        return success_response(serializer.data)

    def post(self, request, indicator_id):
        ensure_admin_or_lead_access(request.user)
        data = request.data.copy()
        data["framework_indicator"] = indicator_id
        serializer = EvidenceRequirementWriteSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(serializer.data)

class EvidenceRequirementUpdateView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def patch(self, request, pk):
        ensure_admin_or_lead_access(request.user)
        requirement = get_object_or_404(EvidenceRequirement, pk=pk)
        serializer = EvidenceRequirementWriteSerializer(requirement, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(serializer.data)
