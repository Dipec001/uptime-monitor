import requests
import os
import logging

logger = logging.getLogger('monitor')


def format_interval(seconds):
    """Format seconds into human-readable interval"""
    if seconds >= 86400:
        days = seconds // 86400
        return f"{days} day{'s' if days != 1 else ''}"
    elif seconds >= 3600:
        hours = seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''}"
    elif seconds >= 60:
        minutes = seconds // 60
        return f"{minutes} minute{'s' if minutes != 1 else ''}"
    else:
        return f"{seconds} second{'s' if seconds != 1 else ''}"


def send_whatsapp_template(to_number, template_name, parameters=None):
    """
    Send WhatsApp template message
    
    Args:
        to_number: Phone number with country code (e.g., "2348147250442")
        template_name: Name of approved template in Meta Business Manager
        parameters: List of parameter values for template variables
    """
    url = f"https://graph.facebook.com/v18.0/{os.getenv('WHATSAPP_PHONE_NUMBER_ID')}/messages"
    headers = {
        "Authorization": f"Bearer {os.getenv('WHATSAPP_TOKEN')}",
        "Content-Type": "application/json"
    }
    
    # Build template components
    template_components = []
    if parameters:
        template_components.append({
            "type": "body",
            "parameters": [
                {"type": "text", "text": str(param)} 
                for param in parameters
            ]
        })
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": "en"
            },
            "components": template_components
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        logger.info(f"📤 Sent WhatsApp template '{template_name}' to {to_number}")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Failed to send WhatsApp template: {str(e)}")
        if hasattr(e.response, 'text'):
            logger.error(f"Response: {e.response.text}")
        raise


def send_whatsapp_message(to_number, message_text):
    """
    Send free-form WhatsApp message (only works within 24hr session window)
    This is kept for backward compatibility but should only be used for replies
    
    Args:
        to_number: Phone number with country code
        message_text: Message content
    """
    url = f"https://graph.facebook.com/v18.0/{os.getenv('WHATSAPP_PHONE_NUMBER_ID')}/messages"
    headers = {
        "Authorization": f"Bearer {os.getenv('WHATSAPP_TOKEN')}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {
            "body": message_text
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        logger.info(f"📤 Sent WhatsApp message to {to_number}")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Failed to send WhatsApp message: {str(e)}")
        if hasattr(e.response, 'text'):
            logger.error(f"Response: {e.response.text}")
        raise


# ============================================
# TEMPLATE HELPERS
# ============================================

def send_website_down_alert(to_number, website_name, website_url, status_code, downtime_start):
    """Send website downtime alert using template"""
    return send_whatsapp_template(
        to_number=to_number,
        template_name="website_down_alert",
        parameters=[
            website_name,
            website_url,
            status_code or "Connection Failed",
            downtime_start,
            "https://alivechecks.com/dashboard"
        ]
    )


def send_website_recovered_alert(to_number, website_name, website_url, downtime_duration, recovered_at):
    """Send website recovery alert using template"""
    return send_whatsapp_template(
        to_number=to_number,
        template_name="website_recovered",
        parameters=[
            website_name,
            website_url,
            downtime_duration,
            recovered_at,
            "https://alivechecks.com/dashboard"
        ]
    )


def send_heartbeat_missed_alert(to_number, heartbeat_name, expected_interval, last_ping, missed_at):
    """Send heartbeat missed alert using template"""
    return send_whatsapp_template(
        to_number=to_number,
        template_name="heartbeat_missed",
        parameters=[
            heartbeat_name,
            expected_interval,
            last_ping or "Never",
            missed_at,
            "https://alivechecks.com/dashboard"
        ]
    )


def send_heartbeat_recovered_alert(to_number, heartbeat_name, missed_duration, recovered_at):
    """Send heartbeat recovery alert using template"""
    return send_whatsapp_template(
        to_number=to_number,
        template_name="heartbeat_recovered",
        parameters=[
            heartbeat_name,
            missed_duration,
            recovered_at,
            "https://alivechecks.com/dashboard"
        ]
    )