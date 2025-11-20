import requests
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from celery import shared_task
from monitor.models import Alert, NotificationPreference, Website, HeartBeat
from django.utils.timezone import now
from datetime import timedelta
from .whatsapp_utils import (
    send_website_down_alert,
    send_website_recovered_alert,
    send_heartbeat_missed_alert,
    send_heartbeat_recovered_alert,
    format_interval
)
from django.contrib.contenttypes.models import ContentType
from celery.exceptions import MaxRetriesExceededError
import logging

# Import email templates
from .email_templates import (
    website_downtime_email,
    website_recovery_email,
    heartbeat_missed_email,
    heartbeat_recovery_email,
    test_notification_email,
    welcome_email,
    password_reset_email
)

logger = logging.getLogger('monitor')


RETRY_INTERVAL_MINUTES = 10
MAX_RETRIES = 3


def send_html_email(to_email, subject, html_content, text_content=None):
    """
    Send HTML email with plain text fallback
    """
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content or "Please view this email in an HTML-capable email client.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"[EMAIL] Error sending HTML email to {to_email}: {str(e)}")
        raise


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_email_alert_task(self, to_email, subject, html_content, text_content=None):
    try:
        send_html_email(to_email, subject, html_content, text_content)
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
def send_password_reset_email_task(self, user_email, reset_link, user_name="there"):
    """Send password reset email"""
    try:
        subject = 'Reset your Alive Checks password'
        html_content = password_reset_email(user_name, reset_link)
        
        # Plain text fallback
        text_content = f"""
Password Reset Request

Hi {user_name},

We received a request to reset your password. Click the link below to reset:
{reset_link}

This link will expire in 24 hours.

If you didn't request this, you can safely ignore this email.

---
Alive Checks - Keeping your sites alive
https://alivechecks.com
        """

        send_html_email(user_email, subject, html_content, text_content)
        logger.info(f"[PASSWORD_RESET] Email sent to {user_email}")

    except Exception as e:
        logger.error(f"[PASSWORD_RESET] Failed for {user_email}: {str(e)}")
        self.retry(exc=e, countdown=10)


@shared_task(bind=True, max_retries=3)
def send_welcome_email_task(self, user_email, user_name="there"):
    """Send welcome email to new users"""
    try:
        subject = 'Welcome to Alive Checks! 🎉'
        html_content = welcome_email(user_name)
        
        # Plain text fallback
        text_content = f"""
Hi {user_name},

Welcome to Alive Checks!

You're now set up to monitor your websites and get instant alerts when they go down.

Getting Started:
1. Add your first website to monitor
2. Configure your alert preferences
3. Relax - we'll watch your sites 24/7

Questions? Reply to this email.

---
Alive Checks - Keeping your sites alive
https://alivechecks.com
        """

        send_html_email(user_email, subject, html_content, text_content)
        logger.info(f"[WELCOME] Email sent to {user_email}")

    except Exception as e:
        logger.error(f"[WELCOME] Failed for {user_email}: {str(e)}")
        # Don't retry welcome emails aggressively
        if self.request.retries < 1:
            self.retry(exc=e, countdown=60)


# =======================
# TEST NOTIFICATIONS
# =======================

@shared_task(bind=True, max_retries=3)
def send_test_notification(self, email, monitor_name, user_name="there"):
    """Send simple test notification email"""
    try:
        subject = f'🔔 Test Alert: {monitor_name}'
        html_content = test_notification_email(user_name, monitor_name)
        
        send_html_email(email, subject, html_content)
        logger.info(f"[TEST] Email sent to {email} for {monitor_name}")

    except Exception as e:
        logger.error(f"[TEST] Failed for {email}: {str(e)}")
        self.retry(exc=e, countdown=10)


# =======================
# ACTUAL DOWNTIME/RECOVERY ALERTS
# =======================

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
def send_whatsapp_alert_task(self, phone_number, alert_type, target_data):
    """
    Send WhatsApp alert using appropriate template
    target_data should contain all necessary fields for the template
    """
    try:
        if alert_type == "website_downtime":
            send_website_down_alert(
                to_number=phone_number,
                website_name=target_data['name'],
                website_url=target_data['url'],
                status_code=target_data.get('status_code'),
                downtime_start=target_data['downtime_start']
            )
        elif alert_type == "website_recovery":
            send_website_recovered_alert(
                to_number=phone_number,
                website_name=target_data['name'],
                website_url=target_data['url'],
                downtime_duration=target_data['downtime_duration'],
                recovered_at=target_data['recovered_at']
            )
        elif alert_type == "heartbeat_downtime":
            send_heartbeat_missed_alert(
                to_number=phone_number,
                heartbeat_name=target_data['name'],
                expected_interval=target_data['expected_interval'],
                last_ping=target_data.get('last_ping'),
                missed_at=target_data['missed_at']
            )
        elif alert_type == "heartbeat_recovery":
            send_heartbeat_recovered_alert(
                to_number=phone_number,
                heartbeat_name=target_data['name'],
                missed_duration=target_data['missed_duration'],
                recovered_at=target_data['recovered_at']
            )
        
        logger.info(f"[WHATSAPP] Sent {alert_type} to {phone_number}")
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
            subject, html_content = build_email_alert(target, alert_type)
            send_email_alert_task.delay(pref.target, subject, html_content)

        elif pref.method == "slack":
            message = build_slack_message(target, alert_type)
            send_slack_alert_task.delay(pref.target, message)

        elif pref.method == "whatsapp":
            target_data = prepare_whatsapp_data(target, alert_type)
            whatsapp_alert_type = get_whatsapp_alert_type(target, alert_type)
            send_whatsapp_alert_task.delay(pref.target, whatsapp_alert_type, target_data)


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
                        f"[!] Last alert for {target} sent recently, "
                        f"skipping retry for now."
                    )
                    return

            notify_users(target, "downtime")
            existing_alert.retry_count += 1
            existing_alert.last_sent_at = now()
            existing_alert.save(update_fields=["retry_count", "last_sent_at"])
            logger.warning(
                f"[!] Retried alert for {target} "
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


def build_email_alert(target, alert_type):
    """
    Build HTML email alerts for Website or HeartBeat
    Returns tuple of (subject, html_content)
    """
    if isinstance(target, Website):
        if alert_type == "downtime":
            # Get the last check result for status code and error
            last_check = target.checks.order_by('-checked_at').first()
            status_code = last_check.status_code if last_check else None
            error_message = last_check.error_message if last_check else ""
            
            subject = f"🚨 Website DOWN: {target.name or target.url}"
            html_content = website_downtime_email(
                website_name=target.name or target.url,
                website_url=target.url,
                status_code=status_code,
                error_message=error_message,
                downtime_start=target.last_downtime_at.strftime("%Y-%m-%d %H:%M:%S UTC") if target.last_downtime_at else now().strftime("%Y-%m-%d %H:%M:%S UTC")
            )
            return subject, html_content
            
        elif alert_type == "recovery":
            downtime_duration = ""
            if target.last_downtime_at and target.last_recovered_at:
                duration = target.last_recovered_at - target.last_downtime_at
                downtime_duration = str(duration).split('.')[0]  # Remove microseconds
            
            subject = f"✅ Website RECOVERED: {target.name or target.url}"
            html_content = website_recovery_email(
                website_name=target.name or target.url,
                website_url=target.url,
                downtime_duration=downtime_duration or "Unknown",
                recovered_at=target.last_recovered_at.strftime("%Y-%m-%d %H:%M:%S UTC") if target.last_recovered_at else now().strftime("%Y-%m-%d %H:%M:%S UTC")
            )
            return subject, html_content

    elif isinstance(target, HeartBeat):
        if alert_type == "downtime":
            subject = f"💔 Heartbeat MISSED: {target.name}"
            html_content = heartbeat_missed_email(
                heartbeat_name=target.name,
                expected_interval=format_interval(target.interval),
                last_ping=target.last_ping.strftime("%Y-%m-%d %H:%M:%S UTC") if target.last_ping else None,
                missed_at=now().strftime("%Y-%m-%d %H:%M:%S UTC")
            )
            return subject, html_content
            
        elif alert_type == "recovery":
            # Calculate missed duration from ping logs
            missed_duration = ""
            last_fail = target.pings.filter(status="fail").order_by('-timestamp').first()
            if last_fail and target.last_ping:
                duration = target.last_ping - last_fail.timestamp
                missed_duration = str(duration).split('.')[0]
            
            subject = f"💚 Heartbeat RECOVERED: {target.name}"
            html_content = heartbeat_recovery_email(
                heartbeat_name=target.name,
                missed_duration=missed_duration or "Unknown",
                recovered_at=now().strftime("%Y-%m-%d %H:%M:%S UTC")
            )
            return subject, html_content

    return "Alert", "<p>Alert notification</p>"


def prepare_whatsapp_data(target, alert_type):
    """
    Prepare structured data for WhatsApp template
    """
    if isinstance(target, Website):
        if alert_type == "downtime":
            # Get the last check result for status code
            last_check = target.checks.order_by('-checked_at').first()
            status_code = last_check.status_code if last_check else None
            
            return {
                'name': target.name or target.url,
                'url': target.url,
                'status_code': status_code,
                'downtime_start': target.last_downtime_at.strftime("%Y-%m-%d %H:%M:%S UTC") if target.last_downtime_at else now().strftime("%Y-%m-%d %H:%M:%S UTC")
            }
        elif alert_type == "recovery":
            downtime_duration = ""
            if target.last_downtime_at and target.last_recovered_at:
                duration = target.last_recovered_at - target.last_downtime_at
                downtime_duration = str(duration).split('.')[0]
            
            return {
                'name': target.name or target.url,
                'url': target.url,
                'downtime_duration': downtime_duration or "Unknown",
                'recovered_at': target.last_recovered_at.strftime("%Y-%m-%d %H:%M:%S UTC") if target.last_recovered_at else now().strftime("%Y-%m-%d %H:%M:%S UTC")
            }
    
    elif isinstance(target, HeartBeat):
        if alert_type == "downtime":
            return {
                'name': target.name,
                'expected_interval': format_interval(target.interval),
                'last_ping': target.last_ping.strftime("%Y-%m-%d %H:%M:%S UTC") if target.last_ping else None,
                'missed_at': now().strftime("%Y-%m-%d %H:%M:%S UTC")
            }
        elif alert_type == "recovery":
            # Calculate missed duration from ping logs
            missed_duration = ""
            last_fail = target.pings.filter(status="fail").order_by('-timestamp').first()
            if last_fail and target.last_ping:
                duration = target.last_ping - last_fail.timestamp
                missed_duration = str(duration).split('.')[0]
            
            return {
                'name': target.name,
                'missed_duration': missed_duration or "Unknown",
                'recovered_at': now().strftime("%Y-%m-%d %H:%M:%S UTC")
            }
    
    return {}


def get_whatsapp_alert_type(target, alert_type):
    """
    Map target and alert_type to WhatsApp template name
    """
    if isinstance(target, Website):
        return f"website_{alert_type}"
    elif isinstance(target, HeartBeat):
        return f"heartbeat_{alert_type}"
    return alert_type


def build_slack_message(target, alert_type):
    """
    Build Slack messages for alerts
    """
    if isinstance(target, Website):
        if alert_type == "downtime":
            return f"*🚨 Website DOWN!*\n{target.url}\nTime: {now().strftime('%Y-%m-%d %H:%M:%S UTC')}"
        elif alert_type == "recovery":
            return f"*✅ Website RECOVERED!*\n{target.url}\nTime: {now().strftime('%Y-%m-%d %H:%M:%S UTC')}"

    elif isinstance(target, HeartBeat):
        if alert_type == "downtime":
            return f"*💔 Heartbeat MISSED!*\n{target.name}\nTime: {now().strftime('%Y-%m-%d %H:%M:%S UTC')}"
        elif alert_type == "recovery":
            return f"*💚 Heartbeat RECOVERED!*\n{target.name}\nTime: {now().strftime('%Y-%m-%d %H:%M:%S UTC')}"

    return f"Alert: {target} is {alert_type}"