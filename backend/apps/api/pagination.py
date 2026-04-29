from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class EnvelopePagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 1000

    def get_page_size(self, request):
        raw_value = request.query_params.get(self.page_size_query_param)
        if isinstance(raw_value, str) and raw_value.strip().lower() == "all":
            return self.max_page_size
        try:
            return super().get_page_size(request)
        except (TypeError, ValueError):
            return self.page_size

    def get_paginated_response(self, data):
        return Response(
            {
                "success": True,
                "data": {
                    "count": self.page.paginator.count,
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                    "results": data,
                },
            }
        )
