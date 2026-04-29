from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def _extract_message(default: str, payload):
    if isinstance(payload, str):
        return payload
    if isinstance(payload, list) and payload and isinstance(payload[0], str):
        return payload[0]
    if isinstance(payload, dict):
        detail = payload.get("detail")
        if isinstance(detail, str):
            return detail
        if isinstance(detail, list) and detail and isinstance(detail[0], str):
            return detail[0]
    return default


def accrediops_exception_handler(exc, context):
    if isinstance(exc, DjangoValidationError):
        return Response(
            {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Validation failed.",
                    "details": getattr(exc, "message_dict", exc.messages),
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    if isinstance(exc, DjangoPermissionDenied):
        return Response(
            {
                "success": False,
                "error": {
                    "code": "PERMISSION_DENIED",
                    "message": str(exc) or "Permission denied.",
                    "details": {},
                },
            },
            status=status.HTTP_403_FORBIDDEN,
        )
    response = exception_handler(exc, context)
    if response is None:
        return Response(
            {
                "success": False,
                "error": {
                    "code": "SERVER_ERROR",
                    "message": "An unexpected error occurred.",
                    "details": {},
                },
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    code = "API_ERROR"
    message = _extract_message("Request failed.", response.data)
    if response.status_code == 400:
        code = "VALIDATION_ERROR"
        message = _extract_message("Validation failed.", response.data)
    elif response.status_code == 401:
        code = "UNAUTHORIZED"
        message = _extract_message("Authentication required.", response.data)
    elif response.status_code == 403:
        code = "PERMISSION_DENIED"
        message = _extract_message("Permission denied.", response.data)
    elif response.status_code == 404:
        code = "NOT_FOUND"
        message = _extract_message("Requested resource was not found.", response.data)
    elif response.status_code == 409:
        code = "CONFLICT"
        message = _extract_message("Request conflicts with existing data.", response.data)
    response.data = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": response.data,
        },
    }
    return response
