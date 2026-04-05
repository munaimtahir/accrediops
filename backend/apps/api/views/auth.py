from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import permissions, status
from rest_framework.views import APIView

from apps.api.responses import success_response
from apps.api.serializers.auth import LoginSerializer
from apps.api.serializers.common import UserSummarySerializer


@method_decorator(ensure_csrf_cookie, name="dispatch")
class AuthSessionView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        return success_response(
            {
                "authenticated": user is not None,
                "user": UserSummarySerializer(user).data if user else None,
            }
        )


class AuthLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return success_response(
            {
                "authenticated": True,
                "user": UserSummarySerializer(user).data,
            },
            response_status=status.HTTP_200_OK,
        )


class AuthLogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return success_response(
            {
                "authenticated": False,
                "user": None,
            }
        )
