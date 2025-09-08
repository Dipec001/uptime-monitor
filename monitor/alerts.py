import requests
from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task
from monitor.models import Alert
from django.utils.timezone import now
from datetime import timedelta
import logging

logger = logging.getLogger('monitor')

@shared_task(bind=True, max_retries=3)
def send_email_alert_task(self, to_email, subject, message):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )
        logger.info(f"[EMAIL] Sent to {to_email}")
    except Exception as e:
        logger.error(f"[EMAIL] Error sending to {to_email}: {str(e)}")
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


def notify_users(website, alert_type):
    preferences = website.notificationpreference_set.filter(is_active=True)
    # message = f"{website.url} is {'DOWN' if alert_type == 'downtime' else 'BACK UP'}."

    for pref in preferences:
        if pref.method == "email":
            subject = f"🔴 Website Down Alert – {website.url}"

            message = f"""
                🚨 Your website is DOWN!

                URL: {website.url}
                Time: {now().strftime('%Y-%m-%d %H:%M:%S')}
                Status: ❌ Unreachable
                Retry Count: 2/3

                We’ll try again in 10 minutes.
                You’ll receive up to 3 alerts, then pause until it's back online.

                – Uptime Monitor
                """

            send_email_alert_task.delay(pref.target, f"[{alert_type.upper()}] {website.url}", message, subject)
        elif pref.method == "slack":
            message = (
                f"*🔴 Website Down Alert!*\n"
                f"*URL:* {website.url}\n"
                f"*Time:* {now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                f"*Status:* ❌ Down\n"
                f"*Retry:* 1/3\n\n"
                f"_We'll retry every 10 minutes, up to 3 times._"
            )
            send_slack_alert_task.delay(pref.target, message)
        elif pref.method == "webhook":
            send_webhook_alert_task.delay(pref.target, {"status": alert_type, "url": website.url})


RETRY_INTERVAL_MINUTES = 10
MAX_RETRIES = 3

def handle_alert(website, alert_type):
    if alert_type == "downtime":
        existing_alert = Alert.objects.filter(
            website=website,
            alert_type="downtime",
            is_active=True
        ).first()

        if existing_alert:
            # Check if retry limit is reached
            if existing_alert.retry_count >= MAX_RETRIES:
                logger.info(f"[!] Retry limit reached for {website.url}, skipping alert.")
                return

            # Enforce 10-minute interval between retries
            if existing_alert.last_sent_at and now() - existing_alert.last_sent_at < timedelta(minutes=RETRY_INTERVAL_MINUTES):
                logger.info(f"[!] Last alert for {website.url} sent recently, skipping retry for now.")
                return

            # Retry: Send and update
            notify_users(website, "downtime")
            existing_alert.retry_count += 1
            existing_alert.last_sent_at = now()
            existing_alert.save(update_fields=["retry_count", "last_sent_at"])
            logger.warning(f"[!] Retried alert for {website.url} (attempt {existing_alert.retry_count})")
            return

        # First time going down: create alert and notify
        Alert.objects.create(
            website=website,
            alert_type="downtime",
            is_active=True,
            retry_count=1,
            last_sent_at=now()
        )
        notify_users(website, "downtime")
        logger.warning(f"[!] First downtime alert created for {website.url}")

    elif alert_type == "recovery":
        # Only notify recovery if there was a previous downtime alert
        existing_alert = Alert.objects.filter(
            website=website,
            alert_type="downtime",
            is_active=True
        ).first()

        if existing_alert:
            existing_alert.is_active = False
            existing_alert.save(update_fields=["is_active"])
            Alert.objects.create(
                website=website,
                alert_type="recovery",
                is_active=False,
                last_sent_at=now()
            )
            notify_users(website, "recovery")
            logger.info(f"[✓] Recovery alert sent for {website.url}")