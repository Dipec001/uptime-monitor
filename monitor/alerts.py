# monitor/alerts.py
import requests
from django.core.mail import send_mail
import logging

logger = logging.getLogger('monitor')

def send_email_alert(to_email, subject, message):
    try:
        send_mail(
            subject,
            message,
            'dpecchukwu@gmail.com',  # Replace with your actual sender later
            [to_email],
            fail_silently=False,
        )
        logger.info(f"[✓] Email sent to {to_email}")
    except Exception as e:
        logger.error(f"[!] Failed to send email to {to_email}: {e}")

def send_slack_alert(webhook_url, message):
    try:
        payload = {"text": message}
        response = requests.post(webhook_url, json=payload)
        response.raise_for_status()
        logger.info(f"[✓] Slack alert sent to {webhook_url}")
    except Exception as e:
        logger.error(f"[!] Failed to send Slack alert: {e}")

def send_webhook_alert(webhook_url, payload):
    try:
        response = requests.post(webhook_url, json=payload)
        response.raise_for_status()
        logger.info(f"[✓] Webhook alert sent to {webhook_url}")
    except Exception as e:
        logger.error(f"[!] Failed to send webhook alert: {e}")
