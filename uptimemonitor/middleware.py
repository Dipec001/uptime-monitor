# middleware.py
from django.utils.deprecation import MiddlewareMixin
from monitor.metrics import http_5xx_responses_total


class Track5xxMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if 500 <= response.status_code < 600:
            view_name = getattr(request, "resolver_match", None)
            view_name = view_name.view_name if view_name else "<unknown>"
            http_5xx_responses_total.labels(view=view_name, method=request.method).inc()
        return response
