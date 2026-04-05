from django.db import connection
from rest_framework import permissions
from rest_framework.views import APIView

from apps.api.responses import success_response


class BackendHealthView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return success_response(
            {
                "status": "ok",
                "service": "accrediops-backend",
                "database": "ok",
            }
        )
