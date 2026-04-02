from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView

from apps.ai_actions.models import GeneratedOutput
from apps.ai_actions.services import accept_generated_output, create_generated_output
from apps.api.responses import success_response
from apps.api.serializers.ai_actions import (
    AcceptAIOutputSerializer,
    GenerateAIOutputSerializer,
    GeneratedOutputSerializer,
)
from apps.indicators.models import ProjectIndicator


class ProjectIndicatorAIOutputsView(ListAPIView):
    serializer_class = GeneratedOutputSerializer

    def get_queryset(self):
        project_indicator = get_object_or_404(ProjectIndicator, pk=self.kwargs["pk"])
        return GeneratedOutput.objects.filter(project_indicator=project_indicator).select_related("created_by", "accepted_by")

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success_response(serializer.data)


class AIGenerateView(APIView):
    def post(self, request):
        serializer = GenerateAIOutputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        generated_output = create_generated_output(actor=request.user, **serializer.validated_data)
        return success_response(GeneratedOutputSerializer(generated_output).data, response_status=201)


class AIAcceptView(APIView):
    def post(self, request, pk):
        generated_output = get_object_or_404(GeneratedOutput, pk=pk)
        serializer = AcceptAIOutputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        generated_output = accept_generated_output(generated_output=generated_output, actor=request.user)
        return success_response(GeneratedOutputSerializer(generated_output).data)
