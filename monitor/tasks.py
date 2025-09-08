from celery import shared_task
from .utils import get_due_websites, check_website_uptime
from .models import Website, UptimeCheckResult, HeartBeat
from django.db import transaction
from datetime import timedelta
from django.utils.timezone import now
from .alerts import handle_alert
import logging

logger = logging.getLogger('monitor')

@shared_task(bind=True, max_retries=3)
def check_single_website(self, website_id):
    try:
        website = Website.objects.get(pk=website_id)

        if not website.is_active:
            logger.info(f"⏸️ Skipped inactive website {website_id}")
            return

        status_code, response_time_ms = check_website_uptime(website.url)

        # ✅ Save check result
        UptimeCheckResult.objects.create(
            website=website,
            status_code=status_code,
            response_time_ms=response_time_ms
        )

        # 🔍 Recovery detection
        if website.is_down and status_code == 200:
            website.is_down = False
            website.last_recovered_at = now()
            logger.info(f"[✓] {website.url} RECOVERED at {website.last_recovered_at}")
            # Send recovery alert
            handle_alert(website, "recovery")
        
        # 🔍 Downtime detection
        recent_checks = website.checks.order_by('-checked_at')[:3]
        if all(check.status_code != 200 for check in recent_checks):
            if not website.is_down:
                website.is_down = True
                website.last_downtime_at = now()
                logger.warning(f"[!] {website.url} DOWN at {website.last_downtime_at}")
                
            # Send downtime alert. Always call handle_alert — even if already marked down
            handle_alert(website, "downtime")

        # 🔁 Schedule next check
        # Floor the current time to the nearest minute
        current_time = now().replace(second=0, microsecond=0)

        # Calculate the next aligned interval (e.g., if interval=1 and it's 00:02:32 → next_check = 00:03:00)
        website.next_check_at = current_time + timedelta(minutes=website.check_interval)
        website.save(update_fields=[
            "is_down",
            "last_downtime_at",
            "last_recovered_at",
            "next_check_at"
        ])

        logger.info(f"[✓] {website.url} checked: {status_code} in {response_time_ms}ms")

    except Website.DoesNotExist:
        logger.warning(f"[!] Website {website_id} no longer exists. Skipping...")

    except Exception as e:
        logger.error(f"[!] Error checking {website_id}: {str(e)}", exc_info=True)
        # Log retry attempt
        logger.warning(f"Retrying check for website {website_id} in 10s (attempt {self.request.retries + 1})")
        self.retry(countdown=10)


@shared_task
def check_due_websites():
    due_websites = get_due_websites()

    count = 0
    for website in due_websites.iterator():  # memory-safe for large queries
        check_single_website.delay(website.id)
        count += 1

    return f"Queued {count} websites for checking."


@shared_task
def cleanup_old_logs(retention_days=90):
    cutoff = now() - timedelta(days=retention_days)
    deleted, _ = UptimeCheckResult.objects.filter(checked_at__lt=cutoff).delete()
    return f"Deleted {deleted} logs older than {retention_days} days"


@shared_task
def process_ping(key, metadata=None):
    try:
        hb = HeartBeat.objects.get(key=key)
    except HeartBeat.DoesNotExist:
        return "Invalid key"

    min_gap = hb.interval // 2  # allow 2x frequency

    if hb.last_ping and (now - hb.last_ping).total_seconds() < min_gap:
        # Too many pings → log it, don’t update
        return f"Rate limited: {hb.name}"

    # Update safely inside transaction
    with transaction.atomic():
        hb.last_ping = now
        hb.status = "up"
        hb.save(update_fields=["last_ping", "status", "updated_at"])

    # Optionally log metadata (if you add a PingLog model)
    return f"Ping accepted: {hb.name}"


@shared_task
def check_heartbeats():
    """Check all heartbeats to see if any have missed their expected ping."""

    for hb in HeartBeat.objects.all():
        if hb.last_ping:
            expected_next = hb.last_ping + timedelta(seconds=hb.interval + hb.grace_period)
            if now() > expected_next and hb.status != "down":
                hb.status = "down"
                hb.save(update_fields=["status", "updated_at"])
                # TODO: fire alert here
                logger.warning(f"[!] Heartbeat DOWN: {hb.name}")