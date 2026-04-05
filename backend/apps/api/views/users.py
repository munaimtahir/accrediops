from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework import generics
from rest_framework.views import APIView

from apps.accounts.models import ClientProfile, User
from apps.api.responses import success_response
from apps.api.serializers.common import ClientProfileSerializer, UserSummarySerializer
from apps.exports.services import replace_variables


class UserListView(generics.ListAPIView):
    serializer_class = UserSummarySerializer

    def get_queryset(self):
        params = self.request.query_params
        queryset = User.objects.filter(is_active=True).order_by("first_name", "last_name", "username")

        if params.get("role"):
            queryset = queryset.filter(role=params["role"])

        if params.get("search"):
            search = params["search"]
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
            )

        return queryset.distinct()

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success_response(serializer.data)


class ClientProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientProfileSerializer

    def get_queryset(self):
        return ClientProfile.objects.order_by("organization_name", "id")

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success_response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = ClientProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return success_response(ClientProfileSerializer(profile).data, response_status=201)


class ClientProfileRetrieveUpdateView(APIView):
    def get(self, request, pk):
        profile = get_object_or_404(ClientProfile, pk=pk)
        return success_response(ClientProfileSerializer(profile).data)

    def patch(self, request, pk):
        profile = get_object_or_404(ClientProfile, pk=pk)
        serializer = ClientProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return success_response(ClientProfileSerializer(profile).data)


class VariablesPreviewSerializer(serializers.Serializer):
    text = serializers.CharField()


class ClientProfileVariablesPreviewView(APIView):
    def post(self, request, pk):
        profile = get_object_or_404(ClientProfile, pk=pk)
        serializer = VariablesPreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data["text"]
        return success_response(
            {
                "text": text,
                "replaced_text": replace_variables(text, profile),
            }
        )
