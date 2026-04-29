from django.db import connection
from rest_framework import permissions
from rest_framework.views import APIView

from apps.api.responses import success_response
from apps.ai_actions.services.provider import get_ai_config
from apps.ai_actions.services.generation import _call_gemini_api
from apps.ai_actions.services.usage import log_ai_usage
from apps.ai_actions.models import AIUsageLog
from apps.workflow.permissions import AdminOnlyPermission, AdminOrLeadPermission


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


class AIHealthView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request):
        config = get_ai_config()
        last_log = AIUsageLog.objects.order_by("-timestamp").first()
        last_success = AIUsageLog.objects.filter(is_success=True).order_by("-timestamp").first()
        last_failure = AIUsageLog.objects.filter(is_success=False).order_by("-timestamp").first()

        return success_response({
            "provider": config.provider,
            "model": config.model,
            "is_configured": config.is_configured,
            "demo_mode": config.demo_mode,
            "api_key_present": bool(config.api_key),
            "last_call": last_log.timestamp if last_log else None,
            "last_success": last_success.timestamp if last_success else None,
            "last_failure": last_failure.timestamp if last_failure else None,
            "last_error": last_failure.error_message if last_failure else None,
        })


class AITestConnectionView(APIView):
    permission_classes = [AdminOnlyPermission]

    def post(self, request):
        config = get_ai_config()
        if config.demo_mode:
            return success_response({"status": "demo_mode", "message": "Connection test skipped in demo mode."})
        
        if not config.is_configured:
            return success_response({"status": "not_configured", "message": "AI provider is not configured."}, response_status=400)

        import time
        start_time = time.time()
        try:
            # Minimal safe prompt for testing
            if config.provider == "gemini":
                _call_gemini_api("Respond with 'OK'", config.model, config.api_key)
            
            log_ai_usage(
                user=request.user,
                feature="Connection Test",
                config=config,
                is_success=True,
                duration_ms=int((time.time() - start_time) * 1000),
            )
            return success_response({"status": "healthy", "message": "AI connection verified successfully."})
        except Exception as e:
            log_ai_usage(
                user=request.user,
                feature="Connection Test",
                config=config,
                is_success=False,
                error_message=str(e),
                duration_ms=int((time.time() - start_time) * 1000),
            )
            return success_response({"status": "failed", "message": f"AI connection failed: {str(e)}"}, response_status=500)
