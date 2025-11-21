from celery import shared_task
from .utils import get_due_websites, check_website_uptime, get_due_heartbeats
from .models import Website, UptimeCheckResult, HeartBeat, PingLog
from django.db import transaction
from datetime import timedelta
from django.utils.timezone import now
from .alerts import handle_alert
from .redis_utils import allow_ping_sliding
import logging
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count
from monitor.helpers import (
    update_active_monitors_count,
    update_active_users_count,
    update_monitors_per_user,
    update_uptime_percentage,
    update_heartbeat_time_since_last_ping,
    update_celery_queue_metrics,
    get_redis_queue_length,
)
from monitor import metrics

logger = logging.getLogger('monitor')


@shared_task(bind=True, max_retries=3)
def check_single_website(self, website_id):
    try:
        website = Website.objects.get(pk=website_id)
        website_url = website.url

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

        # 🔍 Recovery detection
        if website.is_down and status_code == 200:
            website.is_down = False
            website.last_recovered_at = now()
            logger.info(f"[✓] {website_url} RECOVERED at {website.last_recovered_at}")

            # Send recovery alert
            handle_alert(website, "recovery")

        # 🔍 Downtime detection
        recent_checks = website.checks.order_by('-checked_at')[:3]
        if all(check.status_code != 200 for check in recent_checks):
            if not website.is_down:
                website.is_down = True
                website.last_downtime_at = now()
                logger.warning(f"[!] {website_url} DOWN at {website.last_downtime_at}")

            # Send downtime alert.
            handle_alert(website, "downtime")

        # Schedule next check
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

        # If recovering from downtime, track recovery time
        if previous_status == "down":
            hb.last_recovered_at = now()

        hb.update_next_due()  # update next_due automatically
        hb.save(update_fields=["last_ping", "status", "last_recovered_at", "next_due", "updated_at"])

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
            logger.info(f"Skipped paused heartbeat {heartbeat_id}")
            return

        current_time = now()
        if hb.next_due and current_time > hb.next_due:
            # Only update last_downtime_at on FIRST detection
            if hb.status != "down":
                hb.last_downtime_at = current_time
                hb.status = "down"
                hb.save(update_fields=["status", "last_downtime_at", "updated_at"])
            else:
                # Already down - DON'T touch last_downtime_at
                hb.save(update_fields=["updated_at"])

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


# ===========================================
# Celery tasks for periodic metrics collection.
# ===========================================

User = get_user_model()


@shared_task
def collect_business_metrics():
    """
    Collect and update business metrics.
    Schedule this to run every 1-5 minutes.
    """
    from .models import Website, HeartBeat
    
    # Active monitors by type
    active_websites = Website.objects.filter(is_down=False).count()
    active_heartbeats = HeartBeat.objects.filter(status="up").count()
    
    update_active_monitors_count('website', active_websites)
    update_active_monitors_count('heartbeat', active_heartbeats)
    
    # Active users (logged in within last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    active_users = User.objects.filter(last_login__gte=thirty_days_ago).count()
    update_active_users_count(active_users)
    
    # Monitors per user
    users_with_monitors = Website.objects.values('user_id', 'user__email').annotate(
        monitor_count=Count('id')
    )
    
    for user_data in users_with_monitors:
        update_monitors_per_user(
            user_data['user_id'],
            user_data['user__email'],
            user_data['monitor_count']
        )


@shared_task
def collect_uptime_percentages():
    """
    Calculate and update 24-hour uptime percentages for all monitors.
    Schedule this to run every 5-15 minutes.
    """
    from .models import Website, UptimeCheckResult
    
    twenty_four_hours_ago = now() - timedelta(hours=24)
    
    for website in Website.objects.filter(is_active=True):
        # Get all checks in last 24 hours
        checks = UptimeCheckResult.objects.filter(
            website=website,
            checked_at__gte=twenty_four_hours_ago
        )
        
        total_checks = checks.count()
        if total_checks == 0:
            continue
        
        successful_checks = checks.filter(status='success').count()
        uptime_percentage = (successful_checks / total_checks) * 100
        
        update_uptime_percentage(
            str(website.id),
            website.name,
            uptime_percentage
        )


@shared_task
def collect_heartbeat_metrics():
    """
    Update heartbeat time-since-last-ping metrics.
    Schedule this to run every 1-2 minutes.
    """
    from .models import HeartBeat
    
    for heartbeat in HeartBeat.objects.filter(is_active=True):
        if heartbeat.last_ping:
            seconds_since_ping = (now() - heartbeat.last_ping).total_seconds()
            update_heartbeat_time_since_last_ping(
                str(heartbeat.id),
                heartbeat.name,
                seconds_since_ping
            )


@shared_task
def collect_celery_queue_metrics():
    """
    Update Celery queue and worker metrics.
    Schedule this to run every 30 seconds to 1 minute.
    """
    from django.conf import settings
    from celery import current_app
    import redis
    
    # Update from Celery inspect
    update_celery_queue_metrics(current_app)
    
    # Get queue length from Redis (more accurate)
    try:
        redis_client = redis.from_url(settings.CELERY_BROKER_URL)
        get_redis_queue_length(redis_client, 'celery')
        
        # If you have multiple queues
        # get_redis_queue_length(redis_client, 'alerts')
        # get_redis_queue_length(redis_client, 'checks')
        
    except Exception as e:
        print(f"Error collecting Redis queue metrics: {e}")


@shared_task
def collect_database_metrics():
    """
    Collect database connection pool metrics.
    Schedule this to run every 1-2 minutes.
    """
    from django.db import connections
    
    for alias in connections:
        connection = connections[alias]
        
        # This is database-specific, for PostgreSQL:
        try:
            with connection.cursor() as cursor:
                # Get connection stats
                cursor.execute("""
                    SELECT 
                        count(*) FILTER (WHERE state = 'active') as active,
                        count(*) FILTER (WHERE state = 'idle') as idle,
                        count(*) as total
                    FROM pg_stat_activity
                    WHERE datname = current_database()
                """)
                
                result = cursor.fetchone()
                if result:
                    active, idle, total = result
                    
                    metrics.db_connection_pool_size.labels(state='active').set(active)
                    metrics.db_connection_pool_size.labels(state='idle').set(idle)
                    metrics.db_connection_pool_size.labels(state='total').set(total)
                    
        except Exception as e:
            print(f"Error collecting DB metrics: {e}")
