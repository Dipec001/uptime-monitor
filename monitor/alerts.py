import requests
from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task
from monitor.models import Alert, NotificationPreference, Website, HeartBeat
from django.utils.timezone import now
from datetime import timedelta
from .whatsapp_utils import send_whatsapp_message
from django.contrib.contenttypes.models import ContentType
from celery.exceptions import MaxRetriesExceededError
import logging

logger = logging.getLogger('monitor')


RETRY_INTERVAL_MINUTES = 10
MAX_RETRIES = 3


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_email_alert_task(self, to_email, subject, message):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,  # alerts@alivechecks.com
            recipient_list=[to_email],
            fail_silently=False,
        )
        logger.info(f"[EMAIL] Sent to {to_email}")
    except Exception as e:
        logger.error(f"[EMAIL] Error sending to {to_email}: {str(e)}")

        # Don't retry on authentication/permission errors
        if 'AccessDenied' in str(e) or 'InvalidParameterValue' in str(e):
            logger.error(f"[EMAIL] Permanent error, not retrying: {e}")
            return

        try:
            # Exponential backoff: 30s, 60s, 120s, 240s, 480s
            countdown = 30 * (2 ** self.request.retries)
            self.retry(exc=e, countdown=countdown)
        except MaxRetriesExceededError:
            logger.error(f"[EMAIL] Max retries exceeded for {to_email}")


# =======================
# ACCOUNT EMAILS
# =======================

@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_email, reset_link):
    """Send password reset email"""
    try:
        subject = 'Reset your AliveChecks password'
        message = f"""
Password Reset Request

We received a request to reset your password.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you didn't request this, you can safely ignore this email.

---
AliveChecks - Keeping your sites alive
https://alivechecks.com
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.NOREPLY_EMAIL,  # noreply@alivechecks.com
            recipient_list=[user_email],
            fail_silently=False,
        )

        logger.info(f"[PASSWORD_RESET] Email sent to {user_email}")

    except Exception as e:
        logger.error(f"[PASSWORD_RESET] Failed for {user_email}: {str(e)}")
        self.retry(exc=e, countdown=10)


@shared_task(bind=True, max_retries=3)
def send_welcome_email(self, user_email, user_name):
    """Send welcome email to new users"""
    try:
        subject = 'Welcome to AliveChecks! 🎉'
        message = f"""
Hi {user_name},

Welcome to AliveChecks!

You're now set up to monitor your websites and get instant alerts when they go down.

Here's how to get started:
1. Add your first website to monitor
2. Choose your alert preferences
3. Relax - we'll watch your sites for you

Questions? Just reply to this email.

---
AliveChecks - Keeping your sites alive
https://alivechecks.com
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.NOREPLY_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )

        logger.info(f"[WELCOME] Email sent to {user_email}")

    except Exception as e:
        logger.error(f"[WELCOME] Failed for {user_email}: {str(e)}")
        # Don't retry welcome emails aggressively
        if self.request.retries < 1:
            self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_test_website_notification(self, email, user_name, website_name, website_url):
    """Send test notification for a website monitor"""
    try:
        subject = f'🔔 Test Alert: {website_name}'
        message = f"""
Hi {user_name},

This is a TEST notification for your website monitor.

Monitor: {website_name}
URL: {website_url}
Type: Website Uptime Monitor

✅ If you're reading this, alerts for this monitor are working!

When this website goes down, you'll receive an alert at this email address with:
- Downtime detection time
- Response status code or error
- Immediate notification

You can manage notification settings for this monitor in your dashboard.

---
AliveChecks - Keeping your sites alive
https://alivechecks.com
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        logger.info(f"[TEST_WEBSITE] Sent to {email} for {website_name}")

    except Exception as e:
        logger.error(f"[TEST_WEBSITE] Failed for {email}: {str(e)}")
        self.retry(exc=e, countdown=10)


@shared_task(bind=True, max_retries=3)
def send_test_heartbeat_notification(
    self,
    email,
    user_name,
    heartbeat_name,
    heartbeat_interval
):
    """Send test notification for a heartbeat/cron monitor"""
    try:
        # Format interval nicely
        if heartbeat_interval >= 86400:
            interval_str = f"{heartbeat_interval // 86400} day(s)"
        elif heartbeat_interval >= 3600:
            interval_str = f"{heartbeat_interval // 3600} hour(s)"
        elif heartbeat_interval >= 60:
            interval_str = f"{heartbeat_interval // 60} minute(s)"
        else:
            interval_str = f"{heartbeat_interval} second(s)"

        subject = f'🔔 Test Alert: {heartbeat_name}'
        message = f"""
Hi {user_name},

This is a TEST notification for your heartbeat monitor.

Monitor: {heartbeat_name}
Expected Interval: {interval_str}
Type: Heartbeat/Cron Monitor

✅ If you're reading this, alerts for this monitor are working!

When this heartbeat misses a check-in, you'll receive an alert at this email address with:
- Time of missed ping
- Expected vs actual interval
- Grace period information

You can manage notification settings for this monitor in your dashboard.

---
AliveChecks - Keeping your sites alive
https://alivechecks.com
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        logger.info(f"[TEST_HEARTBEAT] Sent to {email} for {heartbeat_name}")

    except Exception as e:
        logger.error(f"[TEST_HEARTBEAT] Failed for {email}: {str(e)}")
        self.retry(exc=e, countdown=10)


@shared_task(bind=True, max_retries=3)
def send_slack_alert_task(self, webhook_url, message):
    try:
        response = requests.post(webhook_url, json={"text": message})
        response.raise_for_status()
        logger.info(f"[SLACK] Sent to {webhook_url}")
    except requests.RequestException as e:
        logger.error(f"[SLACK] Error sending: {e}")
        self.retry(exc=e, countdown=10)


@shared_task(bind=True, max_retries=3)
def send_webhook_alert_task(self, webhook_url, payload):
    try:
        response = requests.post(webhook_url, json=payload)
        response.raise_for_status()
        logger.info(f"[WEBHOOK] Sent to {webhook_url}")
    except requests.RequestException as e:
        logger.error(f"[WEBHOOK] Error sending: {e}")
        self.retry(exc=e, countdown=10)


@shared_task(bind=True, max_retries=3)
def send_whatsapp_alert_task(self, phone_number, message):
    try:
        send_whatsapp_message()
        logger.info(f"[WHATSAPP] Sent to {phone_number}")
    except Exception as e:
        logger.error(f"[WHATSAPP] Error sending to {phone_number}: {str(e)}")
        self.retry(exc=e, countdown=10)


def notify_users(target, alert_type):
    """
    Notify users based on their preferences for a given target (Website or HeartBeat).
    """

    content_type = ContentType.objects.get_for_model(target)
    preferences = NotificationPreference.objects.filter(
        content_type=content_type,
        object_id=target.id
    )

    for pref in preferences:
        if pref.method == "email":
            subject = f"[{alert_type.upper()}] {target}"
            message = build_alert_message(target, alert_type, method="email")
            send_email_alert_task.delay(pref.target, subject, message)

        elif pref.method == "slack":
            message = build_alert_message(target, alert_type, method="slack")
            send_slack_alert_task.delay(pref.target, message)

        elif pref.method == "webhook":
            payload = {"status": alert_type, "target": str(target)}
            send_webhook_alert_task.delay(pref.target, payload)

        elif pref.method == "whatsapp":
            message = build_alert_message(target, alert_type, method="whatsapp")
            send_whatsapp_alert_task.delay(pref.target, message)


def handle_alert(target, alert_type):
    """
    Generic alert handler for Website or HeartBeat.
    """

    content_type = ContentType.objects.get_for_model(target)

    if alert_type == "downtime":
        existing_alert = Alert.objects.filter(
            content_type=content_type,
            object_id=target.id,
            alert_type="downtime",
            is_active=True
        ).first()

        if existing_alert:
            if existing_alert.retry_count >= MAX_RETRIES:
                logger.info(f"[!] Retry limit reached for {target}, skipping alert.")
                return

            if existing_alert.last_sent_at:
                time_since_last = now() - existing_alert.last_sent_at
                if time_since_last < timedelta(minutes=RETRY_INTERVAL_MINUTES):
                    logger.info(
                        f"[!] Last alert for {target} sent recently,"
                        f"skipping retry for now."
                    )
                    return

            notify_users(target, "downtime")
            existing_alert.retry_count += 1
            existing_alert.last_sent_at = now()
            existing_alert.save(update_fields=["retry_count", "last_sent_at"])
            logger.warning(
                f"[!] Retried alert for {target}"
                f"(attempt {existing_alert.retry_count})"
            )
            return

        # First downtime alert
        Alert.objects.create(
            content_type=content_type,
            object_id=target.id,
            alert_type="downtime",
            is_active=True,
            retry_count=1,
            last_sent_at=now()
        )
        notify_users(target, "downtime")
        logger.warning(f"[!] First downtime alert created for {target}")

    elif alert_type == "recovery":
        existing_alert = Alert.objects.filter(
            content_type=content_type,
            object_id=target.id,
            alert_type="downtime",
            is_active=True
        ).first()

        if existing_alert:
            existing_alert.is_active = False
            existing_alert.save(update_fields=["is_active"])
            Alert.objects.create(
                content_type=content_type,
                object_id=target.id,
                alert_type="recovery",
                is_active=False,
                last_sent_at=now()
            )
            notify_users(target, "recovery")
            logger.info(f"[✓] Recovery alert sent for {target}")


def build_alert_message(target, alert_type, method="email"):
    """
    Build alert messages depending on whether target is Website or HeartBeat.
    """
    if isinstance(target, Website):
        if method == "email":
            return f"""
                🚨 Website {alert_type.upper()}!

                URL: {target.url}
                Time: {now().strftime('%Y-%m-%d %H:%M:%S')}
            """
        elif method == "slack":
            return f"*Website {alert_type.upper()}!* {target.url} at {now()}"
        elif method == "whatsapp":
            ts = now().strftime("%Y-%m-%d %H:%M:%S")
            return f"""🚨 Website {alert_type.upper()}!
            URL: {target.url}
            Time: {ts}"""
        elif method == "webhook":
            return {
                "alert_type": alert_type,
                "url": target.url,
                "timestamp": now().isoformat()
            }

    elif isinstance(target, HeartBeat):
        if method == "email":
            return f"""
                🚨 Heartbeat {alert_type.upper()}!

                Service: {target.name}
                Time: {now().strftime('%Y-%m-%d %H:%M:%S')}
            """
        elif method == "slack":
            return f"*Heartbeat {alert_type.upper()}!* {target.name} at {now()}"
        elif method == "whatsapp":
            ts = now().strftime("%Y-%m-%d %H:%M:%S")
            return f"""🚨 Heartbeat {alert_type.upper()}!
            Service: {target.name}
            Time: {ts}"""

        elif method == "webhook":
            return {
                "alert_type": alert_type,
                "service": target.name,
                "timestamp": now().isoformat()
            }

    return f"Alert: {target} is {alert_type}"
