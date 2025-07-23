from django.utils import timezone
import requests
import time
from .models import Website


def get_due_websites():
    now = timezone.now()
    return Website.objects.filter(
        is_active=True,
        next_check_at__lte=now
    ).only('id', 'url', 'check_interval')


def check_website_uptime(url: str, timeout=5):
    start = time.time()
    try:
        response = requests.get(url, timeout=timeout)
        status_code = response.status_code
    except requests.RequestException:
        status_code = 0  # 0 = failed to connect

    elapsed_ms = (time.time() - start) * 1000
    return status_code, round(elapsed_ms, 2)
