from celery import shared_task
from .utils import get_due_websites, check_website_uptime, get_due_heartbeats
from .models import Website, UptimeCheckResult, HeartBeat, PingLog
from django.db import transaction
from datetime import timedelta
from django.utils.timezone import now
from .alerts import handle_alert
from .redis_utils import allow_ping_sliding
# from .metrics import push_website_metric
import logging

logger = logging.getLogger('monitor')


@shared_task(bind=True, max_retries=3)
def check_single_website(self, website_id):
    try:
        website = Website.objects.get(pk=website_id)
        website_url = website.url
        # website_name = website.name

        if not website.is_active:
            logger.info(f"⏸️ Skipped inactive website {website_id}")
            return

        try:
            # 🚦 Perform the actual website check
            status_code, response_time_ms = check_website_uptime(website_url)
        except Exception as e:
            logger.error(
                f"[!] Unexpected error checking {website_url}: {str(e)}",
                exc_info=True
            )
            raise

        # ✅ Save check result
        UptimeCheckResult.objects.create(
            website=website,
            status_code=status_code,
            response_time_ms=response_time_ms
        )
        # try:
        # push_website_metric(website_name or website_url, success=(status_code == 200))
        # except Exception as e:
        # logger.error(f"Failed to push metric for {website_url}: {e}")

        # 🔍 Recovery detection
        if website.is_down and status_code == 200:
            website.is_down = False
            website.last_recovered_at = now()
            logger.info(f"[✓] {website_url} RECOVERED at {website.last_recovered_at}")

            # try:
            #     # Push success metric
            #     push_website_metric(website_name or website_url, success=True)
            # except Exception as e:
            #     logger.error(f"Failed to push metric for {website_url}: {e}")
            # Send recovery alert
            handle_alert(website, "recovery")

        # 🔍 Downtime detection
        recent_checks = website.checks.order_by('-checked_at')[:3]
        if all(check.status_code != 200 for check in recent_checks):
            if not website.is_down:
                website.is_down = True
                website.last_downtime_at = now()
                logger.warning(f"[!] {website_url} DOWN at {website.last_downtime_at}")

            # try:
            #     push_website_metric(website_name or website_url, success=False)
            # except Exception as e:
            #     logger.error(f"Failed to push failure metric for {website_url}: {e}")

            # Send downtime alert.
            handle_alert(website, "downtime")

        # 🔁 Schedule next check
        # Floor the current time to the nearest minute
        current_time = now().replace(second=0, microsecond=0)

        # Calculate the next aligned interval
        # (e.g., if interval=1 and it's 00:02:32 → next_check = 00:03:00)
        website.next_check_at = current_time + timedelta(minutes=website.check_interval)
        website.save(update_fields=[
            "is_down",
            "last_downtime_at",
            "last_recovered_at",
            "next_check_at"
        ])

        logger.info(f"[✓] {website_url} checked: {status_code} in {response_time_ms}ms")

    except Website.DoesNotExist:
        logger.warning(f"[!] Website {website_id} no longer exists. Skipping...")

    except Exception as e:
        logger.error(f"[!] Error checking {website_id}: {str(e)}", exc_info=True)
        # Log retry attempt
        logger.warning(
            f"Retrying check for website {website_id}"
            f"in 10s (attempt {self.request.retries + 1})")
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
    """Delete UptimeCheckResult logs older than retention_days."""
    # TODO: Consider archiving old logs instead of deleting
    cutoff = now() - timedelta(days=retention_days)
    deleted, _ = UptimeCheckResult.objects.filter(checked_at__lt=cutoff).delete()
    return f"Deleted {deleted} logs older than {retention_days} days"


@shared_task
def process_ping(key, metadata=None):
    """Process a heartbeat ping asynchronously with rate limiting and logging,
    and recovery notification if a service comes back online.
    """
    if metadata is None:
        metadata = {}

    # look up heartbeat by it's unique key
    try:
        hb = HeartBeat.objects.get(key=key)
    except HeartBeat.DoesNotExist:
        logger.warning(f"Invalid heartbeat ping received: {key}")
        return "Invalid key"

    # Apply rate limiting (per heartbeat & user)
    # Sliding-window rate limiting
    if not allow_ping_sliding(
        hb.id,
        user_id=hb.user_id,
        interval_seconds=hb.interval,
        max_calls=1
    ):
        logger.info(f"Heartbeat {hb.name} rate limited for user {hb.user.email}")
        return f"Rate limited: {hb.name}"

    # Track previous status so we can detect "recovery"
    previous_status = hb.status

    # Safe DB update
    with transaction.atomic():
        hb.last_ping = now()
        hb.status = "up"
        hb.update_next_due()  # update next_due automatically
        hb.save(update_fields=["last_ping", "status", "next_due", "updated_at"])

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

    # If the heartbeat was DOWN before, send a recovery alert
    if previous_status == "down":
        logger.info(f"Heartbeat {hb.name} RECOVERED for user {hb.user.email}")
        handle_alert(hb, "recovery")

    logger.info(f"Heartbeat {hb.name} ping accepted for user {hb.user.email}")
    return {"heartbeat": hb.name, "status": "accepted"}


@shared_task(bind=True, max_retries=3)
def check_single_heartbeat(self, heartbeat_id):
    try:
        hb = HeartBeat.objects.get(pk=heartbeat_id)

        if not hb.is_active:
            logger.info(f"⏸️ Skipped paused heartbeat {heartbeat_id}")
            return

        current_time = now()
        if hb.next_due and current_time > hb.next_due:
            hb.status = "down"
            hb.save(update_fields=["status", "updated_at"])
            logger.warning(
                f"[!] Heartbeat {hb.name} missed ping"
                f"at {current_time}, marked DOWN"
            )

            PingLog.objects.create(
                heartbeat=hb,
                timestamp=current_time,
                status="fail",
                notes="Heartbeat missed expected interval",
            )

            handle_alert(hb, "downtime")

    except HeartBeat.DoesNotExist:
        logger.warning(f"[!] Heartbeat {heartbeat_id} no longer exists")


@shared_task
def check_due_heartbeats():
    """
    Check all heartbeats that are due and mark them down if missed.
    This task is intended to be run every minute via cron or a periodic task scheduler.
    """
    due_hbs = get_due_heartbeats()
    count = 0
    for hb in due_hbs.iterator():
        check_single_heartbeat.delay(hb.id)
        count += 1
    return f"Queued {count} heartbeats for checking."
