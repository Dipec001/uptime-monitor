import requests
import os
import logging

logger = logging.getLogger('monitor')


def send_whatsapp_message(to_number, message_text):
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
        logger.info("📤 Sent reply to %s: %s", to_number, response.text)
    except Exception as e:
        logger.error("❌ Failed to send WhatsApp reply: %s", str(e))


def send_whatsapp_template(to_number, template_name):
    url = f"https://graph.facebook.com/v18.0/{os.getenv('WHATSAPP_PHONE_NUMBER_ID')}/messages"
    headers = {
        "Authorization": f"Bearer {os.getenv('WHATSAPP_TOKEN')}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": "en"  # or whatever language your template is approved in
            }
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        logger.info("📤 Sent template to %s: %s", to_number, response.text)
    except Exception as e:
        logger.error("❌ Failed to send WhatsApp template: %s", str(e))
