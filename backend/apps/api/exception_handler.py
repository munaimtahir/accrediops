from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


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
    if response.status_code == 400:
        code = "VALIDATION_ERROR"
    elif response.status_code == 403:
        code = "PERMISSION_DENIED"
    elif response.status_code == 404:
        code = "NOT_FOUND"
    response.data = {
        "success": False,
        "error": {
            "code": code,
            "message": "Request failed.",
            "details": response.data,
        },
    }
    return response
