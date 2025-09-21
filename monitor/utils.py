from django.utils import timezone
import requests
import time
from .models import Website, HeartBeat
from django.db.models import F, ExpressionWrapper, DurationField, Func

def get_due_websites():
    """Return a queryset of active websites that are due for a check."""
    now = timezone.now()
    return Website.objects.filter(
        is_active=True,
        next_check_at__lte=now
    ).only('id', 'url', 'check_interval')


def check_website_uptime(url: str, timeout=5):
    """Check the uptime of a website by sending an HTTP GET request."""
    start = time.time()
    try:
        response = requests.get(url, timeout=timeout)
        status_code = response.status_code
    except requests.RequestException:
        status_code = 0  # 0 = failed to connect

    elapsed_ms = (time.time() - start) * 1000
    return status_code, round(elapsed_ms, 2)


def get_due_heartbeats():
    """Return a queryset of active heartbeats that should be checked."""

    now_time = timezone.now()

    # Convert (interval + grace_period) seconds into a DurationField
    total_delay = ExpressionWrapper(
        Func(F("interval") + F("grace_period"), function="make_interval", secs=True),
        output_field=DurationField(),
    )

    return HeartBeat.objects.annotate(
        delay=total_delay
    ).filter(
        status="up",
        last_ping__isnull=False,
        last_ping__lt=now_time - F("delay"),
    ).only("id", "name", "interval")