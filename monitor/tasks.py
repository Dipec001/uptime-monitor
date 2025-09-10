from celery import shared_task
from .utils import get_due_websites, check_website_uptime
from .models import Website, UptimeCheckResult, HeartBeat, PingLog
from django.db import transaction
from datetime import timedelta
from django.utils.timezone import now
from .alerts import handle_alert
from .redis_utils import allow_ping_sliding
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
    """Process a heartbeat ping asynchronously with rate limiting and logging."""
    if metadata is None:
        metadata = {}

    try:
        hb = HeartBeat.objects.get(key=key)
    except HeartBeat.DoesNotExist:
        logger.warning(f"Invalid heartbeat ping received: {key}")
        return "Invalid key"

    # Apply rate limiting (per heartbeat & user)
    # Sliding-window rate limiting
    if not allow_ping_sliding(hb.id, user_id=hb.user_id, interval_seconds=hb.interval, max_calls=1):
        logger.info(f"Heartbeat {hb.name} rate limited for user {hb.user.username}")
        return f"Rate limited: {hb.name}"

    # Safe DB update
    with transaction.atomic():
        hb.last_ping = now
        hb.status = "up"
        hb.save(update_fields=["last_ping", "status", "updated_at"])

    # Log the successful ping
    try:
        PingLog.objects.create(
            heartbeat=hb,
            timestamp=now(),
            status="success",
            ip=metadata.get("ip"),
            user_agent=metadata.get("user_agent"),
            notes=metadata.get("notes", "")
        )
    except Exception as e:
        logger.error(f"Failed to log ping for {hb.name}: {e}")

    logger.info(f"Heartbeat {hb.name} ping accepted for user {hb.user.username}")
    return {"heartbeat": hb.name, "status": "accepted"}


@shared_task
def check_heartbeats():
    """Check all heartbeats and mark as down if overdue."""

    heartbeats = HeartBeat.objects.all()
    for hb in heartbeats:
        if hb.last_ping:
            expected_next = hb.last_ping + timedelta(seconds=hb.interval + hb.grace_period)
            if now() > expected_next and hb.status != "down":
                hb.status = "down"
                hb.save(update_fields=["status", "updated_at"])
                logger.warning(f"[!] Heartbeat DOWN: {hb.name} for user {hb.user.username}")

                # Optional: log downtime event
                PingLog.objects.create(
                    heartbeat=hb,
                    timestamp=now(),
                    status="fail",
                    notes="Heartbeat missed expected interval"
                )