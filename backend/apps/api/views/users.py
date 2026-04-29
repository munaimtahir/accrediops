from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework import generics
from rest_framework.views import APIView

from apps.accounts.models import ClientProfile, User
from apps.api.responses import success_response
from apps.api.serializers.common import ClientProfileSerializer, PasswordResetSerializer, UserSummarySerializer, UserWriteSerializer
from apps.exports.services import replace_variables
from apps.workflow.permissions import AdminOnlyPermission, AdminOrLeadPermission, ExplicitAuthenticatedPermission


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserWriteSerializer
        return UserSummarySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [AdminOnlyPermission()]
        return super().get_permissions()

    def get_queryset(self):
        params = self.request.query_params
        queryset = User.objects.order_by("first_name", "last_name", "username")
        
        if not self.request.user.role == "ADMIN":
            queryset = queryset.filter(is_active=True)

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
        
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success_response(UserSummarySerializer(user).data, response_status=201)


class UserRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserWriteSerializer
    permission_classes = [AdminOnlyPermission]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = UserSummarySerializer(instance)
        return success_response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success_response(UserSummarySerializer(user).data)


class UserPasswordResetView(APIView):
    permission_classes = [AdminOnlyPermission]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data["password"])
        user.save()
        return success_response({"message": "Password reset successfully."})


class ClientProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [AdminOrLeadPermission]

    def get_queryset(self):
        return ClientProfile.objects.prefetch_related("linked_users").order_by("organization_name", "id")

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success_response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = ClientProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return success_response(ClientProfileSerializer(profile).data, response_status=201)


class ClientProfileRetrieveUpdateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request, pk):
        profile = get_object_or_404(ClientProfile.objects.prefetch_related("linked_users"), pk=pk)
        return success_response(ClientProfileSerializer(profile).data)

    def patch(self, request, pk):
        profile = get_object_or_404(ClientProfile.objects.prefetch_related("linked_users"), pk=pk)
        serializer = ClientProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return success_response(ClientProfileSerializer(profile).data)


class VariablesPreviewSerializer(serializers.Serializer):
    text = serializers.CharField()


class ClientProfileVariablesPreviewView(APIView):
    permission_classes = [AdminOrLeadPermission]

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
