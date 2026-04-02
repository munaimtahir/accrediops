from rest_framework import status
from rest_framework.response import Response


def success_response(data, response_status=status.HTTP_200_OK):
    return Response({"success": True, "data": data}, status=response_status)
